variable "vpc_id" {
  type = string
}

variable "public_subnets" {
  type = list(string)
}

variable "private_subnets" {
  type = list(string)
}

variable "cluster_version" {
  type = string
}

variable "cluster_name" {
  type = string
}

variable "node_instance_type" {
  type = string
}

variable "desired_size" {
  type = number
}

variable "max_size" {
  type = number
}

variable "min_size" {
  type = number
}

variable "subnet_ids" {
  type = list(string)
}

variable "enable_irsa" {
  type    = bool
  default = false
}

variable "instance_types" {
  type = list(string)
  
}
variable "key_name" {
    type = string
  
}