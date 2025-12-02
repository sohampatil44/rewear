output "vpc_id"{
    value = aws_vpc.vpc1.id
}
output "vpc_cidr_block"{
    value = aws_vpc.vpc1.cidr_block
} 
output "public_subnet_ids" {
  value = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  value = aws_subnet.private[*].id
}
