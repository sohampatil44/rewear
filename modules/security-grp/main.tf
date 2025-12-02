resource "aws_security_group" "sg1"{
    name = "rewear-sg"
    description = "Security group for rewear"
    vpc_id = var.vpc_id

    ingress {
    from_port = 22
    to_port = 22
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
}

    ingress {
    from_port = 9000
    to_port = 9000
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    }
}

