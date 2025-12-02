terraform {
  required_providers {
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.7.1"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.20"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# -----------------------------
# OIDC & IAM for ALB Controller
# -----------------------------
data "tls_certificate" "eks" {
  url = var.cluster_oidc_issuer
}

resource "aws_iam_openid_connect_provider" "oidc" {
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.eks.certificates[0].sha1_fingerprint]
  url             = var.cluster_oidc_issuer
}

data "aws_iam_policy_document" "alb_assume" {
  statement {
    effect = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]
    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.oidc.arn]
    }
    condition {
      test     = "StringEquals"
      variable = "${replace(var.cluster_oidc_issuer, "https://", "")}:sub"
      values   = ["system:serviceaccount:kube-system:aws-load-balancer-controller"]
    }
  }
}

resource "aws_iam_role" "alb_controller" {
  name               = "${var.cluster_name}-alb-controller-role"
  assume_role_policy = data.aws_iam_policy_document.alb_assume.json
}

resource "aws_iam_policy" "alb_controller_policy" {
  name   = "${var.cluster_name}-alb-controller-policy"
  policy = file("${path.module}/iam_policy.json")
}

resource "aws_iam_role_policy_attachment" "alb_controller_attach" {
  role       = aws_iam_role.alb_controller.name
  policy_arn = aws_iam_policy.alb_controller_policy.arn
}

resource "kubernetes_service_account" "aws_lb_controller" {
  metadata {
    name      = "aws-load-balancer-controller"
    namespace = "kube-system"
    annotations = {
      "eks.amazonaws.com/role-arn" = aws_iam_role.alb_controller.arn
    }
  }

  depends_on = [aws_iam_role.alb_controller]
}

resource "helm_release" "aws_load_balancer_controller" {
  name       = "aws-load-balancer-controller"
  repository = "https://aws.github.io/eks-charts"
  chart      = "aws-load-balancer-controller"
  namespace  = "kube-system"

  set {
    name  = "clusterName"
    value = var.cluster_name
  }

  set {
    name  = "vpcId"
    value = var.vpc_id
  }

  set {
    name  = "serviceAccount.create"
    value = "false"
  }

  set {
    name  = "serviceAccount.name"
    value = "aws-load-balancer-controller"
  }

  set {
    name  = "region"
    value = var.region
  }

  depends_on = [
    aws_iam_openid_connect_provider.oidc,
    kubernetes_service_account.aws_lb_controller
  ]
}

# -----------------------------
# Dynamic ALB Lookup
# -----------------------------
data "aws_lbs" "all" {}

locals {
  rewear_alb_arn = try(one([
    for arn in data.aws_lbs.all.arns : arn
    if can(regex("k8s-default-rewearin", arn))
  ]), null)
}

data "aws_lb" "rewear_alb" {
  count = local.rewear_alb_arn != null ? 1 : 0
  arn   = local.rewear_alb_arn
}

# -----------------------------
# Lambda@Edge for CORS (us-east-1)
# -----------------------------
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

data "aws_iam_policy_document" "lambda_assume" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com", "edgelambda.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "lambda_edge" {
  provider           = aws.us_east_1
  name               = "cloudfront-cors-lambda-edge"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_role_policy_attachment" "lambda_edge_basic" {
  provider   = aws.us_east_1
  role       = aws_iam_role.lambda_edge.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "archive_file" "lambda_zip" {
  type        = "zip"
  output_path = "${path.module}/cors-lambda.zip"

  source {
    content  = <<EOF
exports.handler = async (event) => {
    const response = event.Records[0].cf.response;
    const request = event.Records[0].cf.request;
    const headers = response.headers;
    
    // Get origin from request
    const origin = request.headers.origin ? request.headers.origin[0].value : '*';
    
    // Add CORS headers
    headers['access-control-allow-origin'] = [{ key: 'Access-Control-Allow-Origin', value: origin }];
    headers['access-control-allow-methods'] = [{ key: 'Access-Control-Allow-Methods', value: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE' }];
    headers['access-control-allow-headers'] = [{ key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization,X-Requested-With' }];
    headers['access-control-max-age'] = [{ key: 'Access-Control-Max-Age', value: '86400' }];
    
    // For OPTIONS requests, ensure 200 status
    if (request.method === 'OPTIONS') {
        response.status = '200';
        response.statusDescription = 'OK';
    }
    
    return response;
};
EOF
    filename = "index.js"
  }
}

resource "aws_lambda_function" "cors_lambda" {
  provider         = aws.us_east_1
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "cloudfront-cors-handler"
  role             = aws_iam_role.lambda_edge.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = "nodejs20.x"
  publish          = true
  timeout          = 5
}

# -----------------------------
# CloudFront Distribution for Backend Proxy
# -----------------------------
resource "aws_cloudfront_distribution" "backend_proxy" {
  count = local.rewear_alb_arn != null ? 1 : 0

  enabled             = true
  comment             = "Backend API Cloudfront Proxy"
  default_root_object = ""

  origin {
    domain_name = data.aws_lb.rewear_alb[0].dns_name
    origin_id   = "backend-origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "PATCH", "POST", "DELETE"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "backend-origin"
    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # CachingDisabled
    origin_request_policy_id = "216adef6-5c7f-47e4-b989-5492eafa07d3" # AllViewer

    lambda_function_association {
      event_type   = "origin-response"
      lambda_arn   = aws_lambda_function.cors_lambda.qualified_arn
      include_body = false
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  price_class = "PriceClass_100"
}