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

# Node group IAM role
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

# Attach required policies
resource "aws_iam_role_policy_attachment" "eks_worker_policy" {
  role       = aws_iam_role.eks_node_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
}
resource "aws_iam_role_policy_attachment" "eks_worker_scaling_policy" {
    role = aws_iam_role.eks_node_role.name
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
resource "aws_iam_role_policy_attachment" "eks_AmazonEKSClusterPolicy" {
    policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
    role       = aws_iam_role.eks_cluster_role.name
  
}
resource "aws_iam_role_policy_attachment" "eks_AmazonEKSServicePolicy" {
    policy_arn = "arn:aws:iam::aws:policy/AmazonEKSServicePolicy"
    role       = aws_iam_role.eks_cluster_role.name
  
}
resource "aws_iam_role_policy_attachment" "cluster_autoscaler_policy_attachment" {
  policy_arn = aws_iam_policy.cluster_autoscaler.arn
  role       = aws_iam_role.eks_node_role.name
}

# Managed node group
resource "aws_eks_node_group" "ec2_workers" {
  cluster_name    = aws_eks_cluster.eks_cluster.name
  node_group_name = "${var.cluster_name}-ec2-workers"
  node_role_arn   = aws_iam_role.eks_node_role.arn
  subnet_ids      = var.subnet_ids

  scaling_config {
    desired_size = 2
    min_size     = 1
    max_size     = 5
  }

  labels = {
    role = "ec2"
  }

  tags = {
    "k8s.io/cluster-autoscaler/enabled"                = "true"
    "k8s.io/cluster-autoscaler/${var.cluster_name}"    = "owned"
    "Name"                                             = "${var.cluster_name}-ec2-workers"
    "Environment"                                      = "dev"
  }

  instance_types = var.instance_types

  remote_access {
    ec2_ssh_key = var.key_name
  }

  lifecycle {
    create_before_destroy = true
  }
}
resource "aws_iam_policy" "cluster_autoscaler" {
    name = "${var.cluster_name}-cluster-autoscaler-policy"
    policy = file("${path.module}/cluster-autoscaler-policy.json")
  
}
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


# Get EKS cluster info for kubectl
data "aws_eks_cluster" "eks_cluster" {
  name = aws_eks_cluster.eks_cluster.name
}

data "aws_eks_cluster_auth" "eks_cluster" {
  name = aws_eks_cluster.eks_cluster.name
}
