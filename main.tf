provider "aws" {
  region = var.region
}

# ----------------------------
# VPC MODULE
# ----------------------------
module "vpc" {
  source         = "./modules/vpc"
  vpc_cidr       = var.vpc_cidr
  public_subnets = var.public_subnets
  private_subnets = var.private_subnets
  
}

# ----------------------------
# INTERNET GATEWAY
# ----------------------------
module "internet-gw" {
  source = "./modules/internet-gw"
  vpc_id = module.vpc.vpc_id
}

# ----------------------------
# ROUTE TABLE
# ----------------------------
module "route-table" {
  source             = "./modules/route-table"
  vpc_id             = module.vpc.vpc_id
  igw_id             = module.internet-gw.igw_id
  public_subnet_ids  = module.vpc.public_subnet_ids
  private_subnet_ids = module.vpc.private_subnet_ids
}



# ----------------------------
# SECURITY GROUPS
# ----------------------------
module "security-grp" {
  source = "./modules/security-grp"
  vpc_id = module.vpc.vpc_id
}

# ----------------------------
# EKS MODULE
# ----------------------------
module "eks" {
  source           = "./modules/eks"
  vpc_id           = module.vpc.vpc_id
  public_subnets   = module.vpc.public_subnet_ids
  private_subnets  = module.vpc.private_subnet_ids
  cluster_version  = "1.29"
  cluster_name     = "rewear-eks-cluster"

  node_instance_type = var.node_instance_type
  desired_size       = 1
  max_size           = 4
  min_size           = 1

  # Workers in PUBLIC subnets
  subnet_ids     = module.vpc.public_subnet_ids
  instance_types = ["t3.small"]
  key_name       = var.key_name
  enable_irsa    = true
}

# ----------------------------
# HELM PROVIDER (AFTER EKS IS CREATED)
# ----------------------------
provider "helm" {
  kubernetes {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_cert_data)
    token                  = module.eks.cluster_auth_token
  }
}
provider "kubernetes" {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_cert_data)
    token                  = module.eks.cluster_auth_token
  
}


# ----------------------------
# LOAD BALANCER CONTROLLER MODULE
# ----------------------------
module "load-balancer" {
  source = "./modules/load-balancer"

  cluster_name = module.eks.cluster_name
  vpc_id       = module.vpc.vpc_id
  region       = var.region

  providers = {
    helm = helm
    kubernetes = kubernetes
  }

  cluster_oidc_issuer = module.eks.cluster_oidc_issuer
  cluster_cert_data   = module.eks.cluster_cert_data


  
}
# ----------------------------
# FRONTEND MODULE
# ----------------------------
module "frontend" {
  source = "./modules/frontend"
  region = var.region
}

output "frontend_url" {
    value = module.frontend.cf_url
  
}
#-----------------------------
# TERRAFORM BACKEND
#-----------------------------
terraform {
  backend "s3" {
    bucket  = "rewear-terraform-state-soham-44"
    key = "rewear/terraform.tfstate"
    region  = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt = true
  }
}


# ----------------------------
# NOTIFICATIONS MODULE
# ----------------------------
module "notifications" {
  source = "./modules/notifications"
  
}

# ----------------------------
# UPLOADS BUCKET MODULE
# ----------------------------
module "uploads" {
  source = "./modules/uploads"
    
}