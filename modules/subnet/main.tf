resource "aws_subnet" "public" {
    count = length(var.public_cidrs)
    vpc_id = var.vpc_id
    cidr_block = var.public_cidrs[count.index]
    availability_zone = var.availability_zones[count.index]
    map_public_ip_on_launch = true

    tags = {
        Name = "rewear-public-subnet-${count.index}"
    }


  
}
resource "aws_subnet" "private" {
  count             = length(var.private_cidrs)
  vpc_id            = var.vpc_id
  cidr_block        = var.private_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]
  map_public_ip_on_launch = false

  tags = {
    Name = "rewear-private-subnet-${count.index}"
  }
}