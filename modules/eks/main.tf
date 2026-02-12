################################
# Metric server installation using helm
################################

provider "helm" {
  kubernetes {
    host                   = aws_eks_cluster.eks_cluster.endpoint
    cluster_ca_certificate = base64decode(
      aws_eks_cluster.eks_cluster.certificate_authority[0].data
    )
    token = data.aws_eks_cluster_auth.eks_cluster.token
  }
}
################################
# ARGO ROLLOUTS INSTALLATION
################################

resource "helm_release" "argo_rollouts" {
  name       = "argo-rollouts"
  namespace  = "argo-rollouts"
  create_namespace = true

  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-rollouts"

  depends_on = [
    aws_eks_cluster.eks_cluster
  ]
}



resource "helm_release" "metric_server" {
  name = "metrics-server"
  namespace = "kube-system"
  repository = "https://kubernetes-sigs.github.io/metrics-server/"
  chart = "metrics-server"

  set {
    name = "args[0]"
    value = "--kubelet-insecure-tls"
  }
  
}
################################
# EKS CLUSTER
################################
resource "aws_eks_cluster" "eks_cluster" {
  name     = var.cluster_name
  role_arn = aws_iam_role.eks_cluster_role.arn

  vpc_config {
    subnet_ids = var.subnet_ids
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_AmazonEKSClusterPolicy,
    aws_iam_role_policy_attachment.eks_AmazonEKSServicePolicy
  ]
}

################################
# EKS CLUSTER IAM ROLE
################################
resource "aws_iam_role" "eks_cluster_role" {
  name = "${var.cluster_name}-eks-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect    = "Allow",
      Principal = { Service = "eks.amazonaws.com" },
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_AmazonEKSClusterPolicy" {
  role       = aws_iam_role.eks_cluster_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

resource "aws_iam_role_policy_attachment" "eks_AmazonEKSServicePolicy" {
  role       = aws_iam_role.eks_cluster_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSServicePolicy"
}

################################
# NODE GROUP IAM ROLE
################################
resource "aws_iam_role" "eks_node_role" {
  name = "${var.cluster_name}-eks-node-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect    = "Allow",
      Principal = { Service = "ec2.amazonaws.com" },
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_worker_scaling_policy" {
  role       = aws_iam_role.eks_node_role.name
  policy_arn = "arn:aws:iam::aws:policy/AutoScalingFullAccess"
}

resource "aws_iam_role_policy_attachment" "eks_cni_policy" {
  role       = aws_iam_role.eks_node_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
}

resource "aws_iam_role_policy_attachment" "ecr_read_for_nodes" {
  role       = aws_iam_role.eks_node_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_role_policy_attachment" "ec2_ssm" {
  role       = aws_iam_role.eks_node_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

################################
# MANAGED NODE GROUP
################################
resource "aws_eks_node_group" "ec2_workers" {
  cluster_name    = aws_eks_cluster.eks_cluster.name
  node_group_name = "${var.cluster_name}-ec2-workers"
  node_role_arn   = aws_iam_role.eks_node_role.arn
  subnet_ids      = var.subnet_ids

  scaling_config {
    desired_size = 2
    min_size     = 1
    max_size     = 10
  }

  instance_types = var.instance_types

  labels = {
    role = "ec2"
  }

  tags = {
    "k8s.io/cluster-autoscaler/enabled"             = "true"
    "k8s.io/cluster-autoscaler/${var.cluster_name}" = "owned"
    "Name"                                          = "${var.cluster_name}-ec2-workers"
    "Environment"                                   = "dev"
  }

  remote_access {
    ec2_ssh_key = var.key_name
  }

  lifecycle {
    create_before_destroy = true
  }
}

################################
# CLUSTER AUTOSCALER POLICY
################################
resource "aws_iam_policy" "cluster_autoscaler" {
  name   = "${var.cluster_name}-cluster-autoscaler-policy"
  policy = file("${path.module}/cluster-autoscaler-policy.json")
}
resource "helm_release" "cluster_autoscaler" {
  name       = "cluster-autoscaler"
  repository = "https://kubernetes.github.io/autoscaler"
  chart      = "cluster-autoscaler"
  namespace  = "kube-system"

  set {
    name  = "autoDiscovery.clusterName"
    value = aws_eks_cluster.eks_cluster.name
  }

  set {
    name  = "awsRegion"
    value = "us-east-1"
  }

  set {
    name  = "rbac.serviceAccount.annotations.eks\\.amazonaws\\.com/role-arn"
    value = aws_iam_role.cluster_autoscaler_irsa.arn
  }
}


################################
# EKS DATA SOURCES
################################
data "aws_eks_cluster" "eks_cluster" {
  name = aws_eks_cluster.eks_cluster.name
}

data "aws_eks_cluster_auth" "eks_cluster" {
  name = aws_eks_cluster.eks_cluster.name
}

################################
# OIDC PROVIDER
################################
resource "aws_iam_openid_connect_provider" "eks_oidc" {
  url = data.aws_eks_cluster.eks_cluster.identity[0].oidc[0].issuer

  client_id_list = ["sts.amazonaws.com"]

  thumbprint_list = ["9e99a48a9960b14926bb7f3b02e22da0afd10df6"]
}

################################
# CLUSTER AUTOSCALER IRSA ROLE
################################
resource "aws_iam_role" "cluster_autoscaler_irsa" {
  name = "${var.cluster_name}-cluster-autoscaler-irsa"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Action = "sts:AssumeRoleWithWebIdentity",
      Principal = {
        Federated = aws_iam_openid_connect_provider.eks_oidc.arn
      },
      Condition = {
        StringEquals = {
          "${replace(data.aws_eks_cluster.eks_cluster.identity[0].oidc[0].issuer, "https://", "")}:sub" = "system:serviceaccount:kube-system:cluster-autoscaler",
          "${replace(data.aws_eks_cluster.eks_cluster.identity[0].oidc[0].issuer, "https://", "")}:aud" = "sts.amazonaws.com"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "cluster_autoscaler_policy_attachment" {
  role       = aws_iam_role.cluster_autoscaler_irsa.name
  policy_arn = aws_iam_policy.cluster_autoscaler.arn
}

################################
# FLUENT BIT IRSA ROLE
################################

resource "aws_iam_role" "fluent_bit_irsa" {
  name = "${var.cluster_name}-fluent-bit-irsa"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Action = "sts:AssumeRoleWithWebIdentity",
      Principal = {
        Federated = aws_iam_openid_connect_provider.eks_oidc.arn
      },
      Condition = {
        StringEquals = {
          "${replace(data.aws_eks_cluster.eks_cluster.identity[0].oidc[0].issuer, "https://", "")}:sub" = "system:serviceaccount:logging:fluent-bit",
          "${replace(data.aws_eks_cluster.eks_cluster.identity[0].oidc[0].issuer, "https://", "")}:aud" = "sts.amazonaws.com"
        }
      }
    }]
  })
}

################################
# FLUENT BIT FIREHOSE POLICY
################################
resource "aws_iam_policy" "fluent_bit_firehose" {
  name = "${var.cluster_name}-fluent-bit-firehose"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Action = [
        "firehose:PutRecord",
        "firehose:PutRecordBatch"
      ],
      Resource = "*"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "fluent_bit_attach" {
  role       = aws_iam_role.fluent_bit_irsa.name
  policy_arn = aws_iam_policy.fluent_bit_firehose.arn
}
################################
# S3 BUCKET FOR EKS LOGS
################################
resource "aws_s3_bucket" "eks_logs" {
  bucket = "${var.cluster_name}-eks-logs"
}

################################
# FIREHOSE IAM ROLE
################################
resource "aws_iam_role" "firehose_role" {
  name = "${var.cluster_name}-firehose-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "firehose.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "firehose_s3_policy" {
  name = "firehose-s3-policy"
  role = aws_iam_role.firehose_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "s3:AbortMultipartUpload",
        "s3:GetBucketLocation",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:ListBucketMultipartUploads",
        "s3:PutObject"
      ]
      Resource = [
        aws_s3_bucket.eks_logs.arn,
        "${aws_s3_bucket.eks_logs.arn}/*"
      ]
    }]
  })
}

################################
# KINESIS FIREHOSE DELIVERY STREAM
################################
resource "aws_kinesis_firehose_delivery_stream" "eks_logs" {
  name        = "eks-logs-firehose"
  destination = "extended_s3"

  extended_s3_configuration {
    role_arn   = aws_iam_role.firehose_role.arn
    bucket_arn = aws_s3_bucket.eks_logs.arn

    prefix                  = "eks-logs/!{timestamp:yyyy/MM/dd}/"
    error_output_prefix     = "eks-logs-errors/!{firehose:error-output-type}/!{timestamp:yyyy/MM/dd}/"
    compression_format      = "GZIP"

    buffering_size     = 5
    buffering_interval = 300
  }
}