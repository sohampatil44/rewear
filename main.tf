provider "helm" {
     kubernetes {
       host                   = data.aws_eks_cluster.eks_cluster.endpoint
       cluster_ca_certificate = base64decode(data.aws_eks_cluster.eks_cluster.certificate_authority[0].data)
       token                  = data.aws_eks_cluster_auth.eks_cluster.token
  }
}

provider "aws" {
    region = var.region
}

module "vpc"{
    source = "./modules/vpc"
    vpc_cidr = var.vpc_cidr
   
}

module "subnet" {
    source = "./modules/subnet"
    vpc_id = module.vpc.vpc_id
    vpc_cidr = var.vpc_cidr
    availability_zones = ["us-east-1a", "us-east-1b"]
    public_cidrs = var.public_subnets
    private_cidrs = var.private_subnets
}

module "internet-gw"{
    source = "./modules/internet-gw"
    vpc_id = module.vpc.vpc_id
}

module "route-table"{
    source = "./modules/route-table"
    vpc_id = module.vpc.vpc_id
    igw_id = module.internet-gw.igw_id
    subnet_id = local.all_subnet_ids
}

locals {
    all_subnet_ids = concat(module.subnet.public_subnet_ids, module.subnet.private_subnet_ids)
}

module "security-grp"{
    source = "./modules/security-grp"
    vpc_id = module.vpc.vpc_id
}

#EKS Cluster

module "eks" {
    source = "./modules/eks"
    vpc_id = module.vpc.vpc_id
    public_subnets = module.subnet.public_subnet_ids
    private_subnets = module.subnet.private_subnet_ids
    cluster_version = "1.29"
    cluster_name = "rewear-eks-cluster"

    node_instance_type = var.node_instance_type
    desired_size = 1
    max_size = 4
    min_size = 1
    subnet_ids = local.all_subnet_ids

    enable_irsa = true
    
  
}

module "eks-node-group"{
    source = "./modules/asg"
    ami_id = "ami-08a6efd148b1f7504"
    instance_type = "t3.micro"
    key_name = var.key_name
    security_group_id = module.security-grp.security_group_id
    subnet_ids = module.subnet.public_subnet_ids

}

module "fargate" {
    source = "./modules/fargate"
    cluster_name = module.eks.cluster_name
    subnet_ids = module.subnet.private_subnet_ids
  
}

module "alb"{
    source = "./modules/load-balancer"
    vpc_id = module.vpc.vpc_id
    subnet_ids = module.subnet.public_subnet_ids
    security_group_id = module.security-grp.security_group_id
    cluster_name = module.eks.cluster_name
    region = var.region
}

output "eks_cluster_name"{
    value = module.eks.cluster_name
}

output "alb_dns" {
    value = module.load-balancer.alb_dns
  
}