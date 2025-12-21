output "cf_url" {
    value = aws_cloudfront_distribution.frontend.domain_name
  
}
output "frontend_cf_id" {
    value = aws_cloudfront_distribution.frontend.id
  
}