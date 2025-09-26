resource "aws_s3_bucket" "frontend" {
    bucket = "rewear-frontend-bucket"
    acl = "public-read"

    website {
        index_document = "index.html"
        error_document = "index.html"
    }

    tags = {
        Name = "rewear-frontend-bucket"
        Environment = "Dev"
    }
  
}

resource "aws_s3_bucket_policy" "frontend_policy" {
    bucket = aws_s3_bucket.frontend.id
    policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Effect = "Allow"
                Principal = "*"
                Action = "s3:GetObject"
                Resource = "${aws_s3_bucket.frontend.arn}/*"
            }
        ]
    })
  
}

