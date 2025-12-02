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
variable "cluster_oidc_issuer" {
  description = "The OIDC issuer URL for the EKS cluster"
  type        = string
  
}
variable "cluster_cert_data" {
  description = "The base64 encoded certificate data for the EKS cluster"
  type        = string
  
}