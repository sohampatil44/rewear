resource "aws_ecr_repository" "backend" {
    name = "rewear-backend-repo"
    image_tag_mutability = "MUTABLE"

    image_scanning_configuration {
      scan_on_push = true
    }

    lifecycle {
      prevent_destroy = false
    }
  
}
#this is optiona lifecyle policy to clean old untagged images

resource "aws_ecr_lifecycle_policy" "backend_policy" {
    repository = aws_ecr_repository.backend.name
    policy = <<POLICY
    {
      "rules": [
      {
        "rulePriority": 1,
        "description": "Expire untagged imgs older than 7 days",
        "selection": {
          "tagStatus": "untagged",
          "countType": "sinceImagePushed",
          "countUnit": "days",
          "countNumber": 7
        },
        "action": { "type": "expire" }
      }]
      }
      POLICY
  
}