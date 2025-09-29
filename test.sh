#!/bin/bash

set -euo pipefail

terraform init
terraform apply -auto-approve -var-file="terraform.tfvars"

ALERT_API_URL = $(terraform output -raw alert_api_url)
echo "ALERT_API_URL: $ALERT_API_URL"

sed "s|__ALERT_API_URL__|${ALERT_API_URL}|g" k8s/alertmanager/alert-manager.tpl.yaml > /tmp/alert-manager.yaml

kubectl apply of /tmp/alert-manager.yaml -n monitoring
kubectl apply -f k8s/prometheus/ -n monitoring
kubectl apply -f k8s/grafana/ -n monitoring

#aftrwards il apply any other k8s file after doing backend part 

#for running this - bash test.sh