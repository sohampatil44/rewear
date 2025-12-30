resource "aws_s3_bucket" "rewear_uploads" {
    bucket = "rewear-uploads-bucket"

    versioning {
        enabled = true
    }

    tags = {
        Name = "RewearUploads"
        Environment = "Production"
    }
  
}
resource "aws_s3_bucket_public_access_block" "uploads_public_access" {
    bucket = aws_s3_bucket.rewear_uploads.id

    block_public_acls       = false
    block_public_policy     = false
    ignore_public_acls      = false
    restrict_public_buckets = false
  
}
resource "aws_s3_bucket_policy" "uploads_policy" {
    bucket = aws_s3_bucket.rewear_uploads.id
    policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Effect    = "Allow"
                Principal = "*"
                Action    = ["s3:GetObject","s3:PutObject"],
                Resource  = "${aws_s3_bucket.rewear_uploads.arn}/*"
            }
        ]
    })
    depends_on = [ aws_s3_bucket_public_access_block.uploads_public_access ]
  
}


