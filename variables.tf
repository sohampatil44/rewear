variable "region" {
  description = "The AWS region to deploy resources in"
  type        = string
  default     = "us-east-1"

}
variable "vpc_cidr" {
  description = "The CIDR block for the VPC"
  type        = string
}

variable "key_name" {
  description = "The name of the existing key pair to use for EC2 instances"
  type        = string
  
}
variable "public_subnets" {
  default = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnets" {
  default = ["10.0.3.0/24", "10.0.4.0/24"]
}
variable "node_instance_type" {
    description = "EC2 instance type for the EKS worker nodes"
    type        = string
    default     = "t3.micro"
  
}
variable "cluster_name" {
  description = "The name of the EKS cluster"
  type        = string
  default     = "rewear-eks-cluster"
  
}

