#!/usr/bin/env bash
set -euo pipefail

# assume we run from repo root
cd modules/notifications

# 1) package lambda (CI will do this every run)
pip install boto3
zip -r lambda.zip lambda_function.py

cd ../..  # back to repo root

# 2) terraform apply in the module (or at repo root if you run root terraform)
# If you run terraform at repo root, ensure module path is included there; otherwise cd to proper dir.
terraform init -input=false
terraform apply -auto-approve

# 3) get the API URL
ALERT_API_URL=$(terraform output -raw alert_api_url)

echo "Alert API URL: $ALERT_API_URL"

# 4) build Alertmanager config from template and apply to cluster
# requires kubectl configured (CI must aws eks update-kubeconfig or use in-cluster runner)
sed "s|__ALERT_API_URL__|${ALERT_API_URL}|g" k8s/alertmanager/alert-manager.tpl.yaml > /tmp/alert-manager.yaml

# apply to the cluster
kubectl apply -f /tmp/alert-manager.yaml -n monitoring
