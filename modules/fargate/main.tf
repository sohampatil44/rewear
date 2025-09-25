resource "aws_eks_fargate_profile" "fp" {
    cluster_name = var.cluster_name
    fargate_profile_name = "rewear-fargate-profile"
    subnet_ids = var.subnet_ids
    pod_execution_role_arn = aws_iam_role.fargate_pod_execution_role.arn
    selector {
      namespace = "fargate-apps"
    }
  
}


resource "aws_iam_role" "fargate_pod_execution_role" {
    name = "rewear-eks-cluster-fargate-pod-execution-role"
    assume_role_policy = jsonencode({
        Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "eks-fargate-pods.amazonaws.com"
        },
        Action = "sts:AssumeRole"
      }
    ]
    })
  
}
resource "aws_iam_role_policy_attachment" "fargate_pod_execution_policy" {
    role = aws_iam_role.fargate_pod_execution_role.name
    policy_arn = "arn:aws:iam::aws:policy/AmazonEKSFargatePodExecutionRolePolicy"
  
}
