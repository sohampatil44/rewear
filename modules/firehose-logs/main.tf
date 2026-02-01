resource "aws_s3_bucket" "eks_logs" {
    bucket = "rewear-eks-soham-logs"
  
}

resource "aws_kinesis_firehose_delivery_stream" "eks_logs" {
    name= "eks-logs-firehose"
    destination = "extended_s3"

    extended_s3_configuration {
      role_arn = aws_iam_role.firehose_role.arn
      bucket_arn = aws_s3_bucket.eks_logs.arn

      prefix ="eks-logs/!{timestamp:yyyy/MM/dd}/"
      compression_format = "GZIP"

      buffering_size = 5
      buffering_interval = 300

    }
  
}