import json
import os
import boto3

sns = boto3.client("sns")
TOPIC_ARN = os.environ.get("SNS_TOPIC_ARN")  # set by Terraform

def lambda_handler(event, context):
    # Alertmanager sends JSON in the HTTP body
    body = {}
    try:
        body = json.loads(event.get("body", "{}"))
    except Exception:
        body = {"raw_event": event}

    # Build a compact message for email/SNS
    message = json.dumps({
        "status": body.get("status"),
        "alerts": body.get("alerts", []),
    }, indent=2)

    sns.publish(
        TopicArn=TOPIC_ARN,
        Message=message,
        Subject="Prometheus Alert"
    )

    return {"statusCode": 200, "body": json.dumps({"ok": True})}
