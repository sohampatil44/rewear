data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}

resource "aws_s3_bucket" "frontend" {
  bucket = "rewear-frontend-bucket"

  
  
}
resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  index_document {
    suffix = "index.html"
  }
  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend_public_access" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
  
}
resource "aws_s3_bucket_policy" "frontend_policy" {
  bucket = aws_s3_bucket.frontend.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.frontend.arn}/*"
      }
    ]
  })
  depends_on = [ aws_s3_bucket_public_access_block.frontend_public_access ]
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "frontend" {
  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "S3-rewear-frontend-bucket"
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

 default_cache_behavior {
  target_origin_id       = "S3-rewear-frontend-bucket"
  viewer_protocol_policy = "redirect-to-https"

  allowed_methods  = ["GET", "HEAD", "OPTIONS"]
  cached_methods   = ["GET", "HEAD"]

  cache_policy_id = data.aws_cloudfront_cache_policy.caching_optimized.id
}


  custom_error_response {
    error_code       = 403
    response_code = 200
    response_page_path = "/index.html"
}
custom_error_response {
    error_code       = 404
    response_code = 200
    response_page_path = "/index.html"
}
# ordered_cache_behavior {
#   path_pattern     = "/admin/*"
#   target_origin_id = "alb-origin"

#   allowed_methods  = ["GET", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"]
#   cached_methods   = ["GET", "HEAD"]

#   cache_policy_id          = data.aws_cloudfront_cache_policy.caching_disabled.id
#   origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer.id

#   viewer_protocol_policy = "redirect-to-https"
# }
# ordered_cache_behavior {
#   path_pattern     = "/items/*"
#   target_origin_id = "alb-origin"

#   allowed_methods  = ["GET", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"]
#   cached_methods   = ["GET", "HEAD"]

#   cache_policy_id          = data.aws_cloudfront_cache_policy.caching_disabled.id
#   origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer.id

#   viewer_protocol_policy = "redirect-to-https"
# }
# ordered_cache_behavior {
#   path_pattern     = "/swaps/*"
#   target_origin_id = "alb-origin"

#   allowed_methods  = ["GET", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"]
#   cached_methods   = ["GET", "HEAD"]

#   cache_policy_id          = data.aws_cloudfront_cache_policy.caching_disabled.id
#   origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer.id

#   viewer_protocol_policy = "redirect-to-https"
# }


  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name        = "rewear-frontend-cf"
    Environment = "Dev"
  }
}
data "aws_cloudfront_cache_policy" "caching_disabled" {
  name = "Managed-CachingDisabled"
}
data "aws_cloudfront_origin_request_policy" "all_viewer" {
  name = "Managed-AllViewerExceptHostHeader"
}



# Get the ALB DNS of your backend Ingress (from EKS)
data "kubernetes_ingress_v1" "backend_ingress" {
  metadata {
    name      = "rewear-ingress"
    namespace = "default"
  }
}

# CloudFront distribution for backend API
resource "aws_cloudfront_distribution" "backend" {
  origin {
    domain_name = data.kubernetes_ingress_v1.backend_ingress.status[0].load_balancer[0].ingress[0].hostname
    origin_id   = "backend-origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Backend API Cloudfront Proxy"
  default_root_object = ""


  default_cache_behavior {
    target_origin_id       = "backend-origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "POST", "PUT", "DELETE", "PATCH"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]

    forwarded_values {
      query_string = true
      headers      = ["*"]
      cookies {
        forward = "all"
      }
    }
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name        = "rewear-backend-cf"
    Environment = "Dev"
  }
}

# Output CloudFront domain
output "backend_cloudfront_domain" {
  value = aws_cloudfront_distribution.backend.domain_name
}

