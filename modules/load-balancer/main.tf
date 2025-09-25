resource "aws_iam_openid_connect_provider" "oidc" {
    client_id_list = ["sts.amazonaws.com"]
    thumbprint_list = [data.tls_certificate.eks.certificate[0].sha1_fingerprint]
    url = data.aws_eks_cluster.cluster.identity[0].oidc[0].issuer
  
}
data "aws_eks_cluster" "cluster" {
    name =var.cluster_name
  
}

data "aws_eks_cluster_auth" "cluster" {
    name = var.cluster_name
  
}
data "tls_certificate" "eks"{
    url = data.aws_eks_cluster.cluster.identity[0].oidc[0].issuer
}

#IAM Role for Load balancer Controller

resource "aws_iam_role" "alb_controller" {
    name = "${var.cluster_name}-alb-controller-role"
    assume_role_policy = data.aws_iam_policy_document.alb_assume.json
  
}

data "aws_iam_policy_document" "alb_assume" {
    statement {
      effect = "Allow"
      actions = ["sts:AssumeRoleWithWebIdentity"]
      principals {
        type = "Federated"
        identifiers = [aws_iam_openid_connect_provider.oidc.arn]
      }
      condition {
        test = "StringEquals"
        variable = "${replace(data.aws_eks_cluster.cluster.identity[0].oidc[0].issuer,"https://", "")}:sub"
        values = ["system:serviceaccount:kube-system:aws-load-balancer-controller"]
      }
    }
  
}

resource "helm_release" "aws_load_balancer_controller" {
    name = "aws-load-balancer-controller"
    repository = "https://aws.github.io/eks-charts"
    chart = "aws-load-balancer-controller"
    namespace = "kube-system"

    set{
        name = "clusterName"
        value = var.cluster_name
    }
    set {
        name = "vpcId"
        value = var.vpc_id
    }
    set {
        name = "serviceAccount.create"
        value = "false"
    }
    set {
        name = "serviceAccount.name"
        value = "aws-load-balancer-controller"
    }
    set {
        name = "region"
        value = var.region
    }
    depends_on = [
    aws_eks_cluster.eks_cluster,
    aws_iam_role.alb_controller,
    aws_iam_openid_connect_provider.oidc
]
  
}