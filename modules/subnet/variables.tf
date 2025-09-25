variable "vpc_id" {
  description = "The ID of the VPC"
  type        = string
  
}
variable "availability_zones" {
    type = list(string)
    default = [ "us-east-1a","us-east-1b" ]
  
}
variable "vpc_cidr" {
  description = "The CIDR block for the VPC"
  type        = string
  
}
variable "public_cidrs" {
  description = "List of public subnet CIDR blocks"
  type        = list(string)
  
}
variable "private_cidrs" {
  description = "List of private subnet CIDR blocks"
  type        = list(string)
  
}