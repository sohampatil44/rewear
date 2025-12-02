variable "vpc_id" {
    description = "The ID of the VPC"
    type        = string
  
}
variable "igw_id" {
    description = "The ID of the Internet Gateway"
    type        = string
  
}
variable "public_subnet_ids" {
  description = "List of public subnet IDs"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs"
  type        = list(string)
}
