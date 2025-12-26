output cf_url {
    value = module.frontend.cf_url
  
}
output "backend_cloudfront_url" {
  value = module.load-balancer.backend_cloudfront_url
}

output "alert_webhook_url" {
  value = module.notifications.alert_api_url
  
}
output "uploads_bucket_name" {
    value = module.uploads.uploads_bucket_name
  
}