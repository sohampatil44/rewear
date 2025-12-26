resource "aws_s3_bucket" "rewear_uploads" {
    bucket = "rewear-uploads-bucket"
    acl = "public-read"

    versioning {
        enabled = true
    }

    tags = {
        Name = "RewearUploads"
        Environment = "Production"
    }
  
}


