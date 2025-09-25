output "cluster_name" {
    value = aws_eks_cluster.eks_cluster.name
  
}
output "cluster_ca" {
    value = aws_eks_cluster.eks_cluster.certificate_authority[0].data
  
}
output "cluster_endpoint" {
    value = aws_eks_cluster.eks_cluster.endpoint
  
}
output "cluster_token" {
    value = aws_eks_cluster.eks_cluster.token
  
}