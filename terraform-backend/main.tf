provider "aws" {
    region = "us-east-1"

}

resource "aws_s3_bucket" "tf_state" {
    bucket = "rewear-terraform-state-soham-44"

    lifecycle {
      prevent_destroy = true
    }
  
}

resource "aws_s3_bucket_versioning" "versioning" {
    bucket = aws_s3_bucket.tf_state.id 

    versioning_configuration {
        status = "Enabled"
    }
  
}
resource "aws_dynamodb_table" "tf_lock" {
    name = "terraform-locks"
    billing_mode = "PAY_PER_REQUEST"
    hash_key = "LockID"


    attribute {
        name = "LockID"
        type = "S"
    }
  
}