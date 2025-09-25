variable "vpc_id" {
    description = "The ID of the VPC"
    type        = string
  
}
variable "igw_id" {
    description = "The ID of the Internet Gateway"
    type        = string
  
}
variable "subnet_id" {
    description = "value of the subnet"
    type        = list(string)
  
}