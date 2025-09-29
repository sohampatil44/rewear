output "sns_topic_arn" {
    value = aws_sns_topic.alerts.arn
  
}
output "api_endpoint" {
    value = aws_apigatewayv2_api.alert_api.api_endpoint
  
}
output "alert_api_url" {
    value = "${aws_apigatewayv2_api.alert_api.api_endpoint}/${aws_apigatewayv2_stage.alerts_stage.name}/alert"
  
}