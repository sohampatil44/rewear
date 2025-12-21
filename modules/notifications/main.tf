resource "aws_sns_topic" "alerts" {
    name = "rewear-alerts"
  
}

resource "aws_sns_topic_subscription" "email" {
    topic_arn = aws_sns_topic.alerts.arn
    protocol = "email"
    endpoint = "hydrogen939@gmail.com"

  
}
data "aws_iam_policy_document" "lambda_assume" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

#iam role for lambda to publish to sns topic
resource "aws_iam_role" "lambda_exec" {
    name = "rewear-lambda-exec-role"
    assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

#aws lambda function to publish message to sns topic
data "archive_file" "lambda_zip" {
    type = "zip"
    source_file = "${path.module}/lambda_function.py"
    output_path = "${path.module}/lambda.zip"
}

resource "aws_lambda_function" "alert_handler" {
    function_name = "rewear-alert-handler"
    role = aws_iam_role.lambda_exec.arn
    handler = "lambda_function.lambda_handler"
    runtime = "python3.8"
    filename = data.archive_file.lambda_zip.output_path
    source_code_hash = data.archive_file.lambda_zip.output_base64sha256

    environment {
        variables = {
          SNS_TOPIC_ARN = aws_sns_topic.alerts.arn
        }
    }
}

resource "aws_lambda_permission" "allow_sns" {
    statement_id = "AllowExecutionFromSNS"
    action = "lambda:InvokeFunction"
    function_name = aws_lambda_function.alert_handler.function_name
    principal = "apigateway.amazonaws.com"
    source_arn = "${aws_apigatewayv2_api.alert_api.execution_arn}/*/*"
  
}
resource "aws_apigatewayv2_api" "alert_api" {
    name = "rewear-alert-api"
    protocol_type = "HTTP"
  
}
resource "aws_apigatewayv2_integration" "alerts_lambda" {
    api_id = aws_apigatewayv2_api.alert_api.id
    integration_type = "AWS_PROXY"
    integration_uri = aws_lambda_function.alert_handler.invoke_arn
    payload_format_version = "2.0"
  
}
resource "aws_apigatewayv2_route" "alerts_route" {
    api_id = aws_apigatewayv2_api.alert_api.id
    route_key = "POST /alert"
    target = "integrations/${aws_apigatewayv2_integration.alerts_lambda.id}"
  
}
resource "aws_apigatewayv2_stage" "alerts_stage" {
    api_id = aws_apigatewayv2_api.alert_api.id
    name = "dev"
    auto_deploy = true
  
}