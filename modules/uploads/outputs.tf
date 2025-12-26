output "uploads_bucket_name" {
    value = aws_s3_bucket.rewear_uploads.id
  
}
output "uploads_bucket_arn" {
    value = aws_s3_bucket.rewear_uploads.arn
}