resource "aws_launch_template" "lt1" {
    name_prefix = "rewear-lt-"
    image_id = var.ami_id
    instance_type = var.instance_type

    key_name = var.key_name

    network_interfaces {
      associate_public_ip_address = true
      security_groups = var.security.group_ids
    }

    lifecycle {
      create_before_destroy = true
    }

    tag_specifications {
      resource_type = "instance"
      tags = {
        Name = "rewear-instance"
      }
    }
  
}

resource "aws_autoscaling_group" "asg1" {
    name = "rewear-asg"
    desired_capacity = 1
    min_size = 1
    max_size = 2
    vpc_zone_identifier = var.subnet_ids
    health_check_type = "EC2"
    force_delete = true
    launch_template {
      id = aws_launch_template.lt1.id
      version = "$Latest"
    }
    tag{
        key = "Name"
        value = "rewear-instance"
        propagate_at_launch = true
    }
  
}