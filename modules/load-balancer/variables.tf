variable "cluster_name" {
  description = "The name of the EKS cluster"
  type        = string
  
}
variable "vpc_id" {
  description = "The ID of the VPC"
  type        = string
  
}
variable "region" {
    description = "The AWS region"
    type        = string
  
}