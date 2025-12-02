output "cluster_name" {
  value = aws_eks_cluster.eks_cluster.name
}

output "cluster_id" {
  value = aws_eks_cluster.eks_cluster.id
}

output "cluster_endpoint" {
  value = aws_eks_cluster.eks_cluster.endpoint
}

output "cluster_cert_data" {
  value = aws_eks_cluster.eks_cluster.certificate_authority[0].data
}

output "cluster_auth_token" {
  value = data.aws_eks_cluster_auth.eks_cluster.token
}
output "cluster_oidc_issuer" {
  value = aws_eks_cluster.eks_cluster.identity[0].oidc[0].issuer
  
}