variable "cluster_name" {
  description = "The name of the EKS cluster"
  type        = string
  
}
variable "subnet_ids" {
    description = "A list of subnet IDs for the EKS cluster"
    type        = list(string)
  
}