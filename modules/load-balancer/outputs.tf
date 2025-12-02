output "backend_cloudfront_url" {
  value = local.rewear_alb_arn != null ? aws_cloudfront_distribution.backend_proxy[0].domain_name : null
}
