#!/usr/bin/env bash
set -euo pipefail

# --- AWS configuration ---
export AWS_PROFILE=default
export REGION=us-east-1
export ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export REPO_URL="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/rewear-backend"
echo "ECR URL: $REPO_URL"

# --- Terraform deployment ---
echo "Deploying infrastructure with Terraform..."
terraform init -input=false
terraform apply -auto-approve -var-file="terraform.tfvars"


# --- Wait for EKS cluster ---
CLUSTER_NAME=$(aws eks list-clusters --query "clusters[0]" --output text --region "$REGION")
echo "Waiting for EKS cluster '$CLUSTER_NAME' to be ACTIVE..."
until aws eks describe-cluster --name "$CLUSTER_NAME" --query "cluster.status" --output text --region "$REGION" | grep -q "ACTIVE"; do
  sleep 10
done
echo "✅ Cluster '$CLUSTER_NAME' is ACTIVE."

# --- Configure kubectl ---
aws eks update-kubeconfig --name "$CLUSTER_NAME" --region "$REGION"
kubectl get nodes >/dev/null 2>&1 || { echo "❌ Could not connect to cluster. Aborting."; exit 1; }

terraform apply -auto-approve -var-file="terraform.tfvars"


# --- ECR setup ---
aws ecr describe-repositories --repository-names rewear-backend --region "$REGION" >/dev/null 2>&1 || \
aws ecr create-repository --repository-name rewear-backend --region "$REGION"

# --- Deploy base Kubernetes resources (without backend pods yet) ---
echo "Deploying Kubernetes base resources..."
kubectl apply -f k8s/mongo-secret.yaml
kubectl apply -f k8s/Services.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/ingress.yaml

# --- Wait for ALB DNS ---
echo "Waiting for ALB DNS..."
ALB_DNS=""
for i in {1..60}; do
  ALB_DNS=$(kubectl get ingress rewear-ingress -n default -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || true)
  if [ -n "$ALB_DNS" ]; then
    echo "✅ ALB DNS: $ALB_DNS"
    break
  fi
  echo "Waiting for ALB... ($i/60)"
  sleep 10
done

# --- Poll CloudFront (Backend) ---
echo "Checking for Backend CloudFront distribution..."
BACKEND_CLOUDFRONT=""
for i in {1..3}; do
  BACKEND_CLOUDFRONT=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?Comment=='Backend API Cloudfront Proxy'].DomainName | [0]" \
    --output text 2>/dev/null || true)
  if [ -n "$BACKEND_CLOUDFRONT" ]; then
    echo "✅ Backend CloudFront: $BACKEND_CLOUDFRONT"
    break
  fi
  echo "Waiting for Backend CloudFront... ($i/3)"
  sleep 10
done

# --- Poll CloudFront (Frontend) ---
echo "Checking for Frontend CloudFront distribution..."
FRONTEND_CLOUDFRONT=""
for i in {1..60}; do
  FRONTEND_CLOUDFRONT=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?Origins.Items[0].DomainName!=null && contains(Origins.Items[0].DomainName, 's3')].DomainName | [0]" \
    --output text 2>/dev/null || true)
  if [ -n "$FRONTEND_CLOUDFRONT" ] && [ "$FRONTEND_CLOUDFRONT" != "None" ]; then
    echo "✅ Frontend CloudFront: $FRONTEND_CLOUDFRONT"
    break
  fi
  echo "Waiting for Frontend CloudFront... ($i/60)"
  sleep 10
done

# --- Determine URLs ---
if [ -n "$BACKEND_CLOUDFRONT" ]; then
  BACKEND_URL="https://$BACKEND_CLOUDFRONT/api"
elif [ -n "$ALB_DNS" ]; then
  BACKEND_URL="http://$ALB_DNS/api"
else
  echo "❌ No backend URL found!"
  BACKEND_URL=""
fi

if [ -n "$FRONTEND_CLOUDFRONT" ] && [ "$FRONTEND_CLOUDFRONT" != "None" ]; then
  FRONTEND_URL="https://$FRONTEND_CLOUDFRONT"
else
  echo "⚠️  No frontend CloudFront found, using localhost"
  FRONTEND_URL="http://localhost:3000"
fi

echo "=========================================="
echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo "=========================================="

# --- Get MongoDB URI from existing .env or use default ---
cd /Users/sohampatil/Documents/Rewear/rewear-backend

# --- Update Backend .env with correct FRONTEND_URL ---
cat > .env << EOF
FRONTEND_URL=$FRONTEND_URL
PORT=5001
EOF

echo "✅ Backend .env updated:"
cat .env

# --- NOW build & push Docker image with correct .env ---
echo "Building and pushing Docker image with correct environment variables..."
cd /Users/sohampatil/Documents/Rewear
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$REPO_URL"
docker buildx create --use || true
docker buildx build --no-cache --platform linux/amd64 -t "${REPO_URL}:latest" rewear-backend/ --push

# --- Deploy backend pods NOW ---
echo "Deploying backend pods..."
kubectl apply -f k8s/Deployment.yaml
kubectl rollout status deployment/rewear-backend -n default --timeout=5m || true

# --- Update Frontend .env with Backend URL ---
cd /Users/sohampatil/Documents/Rewear/rewear-frontend
cat > .env << EOF
REACT_APP_API_URL=$BACKEND_URL
EOF

echo "✅ Frontend .env updated:"
cat .env

# --- Build and deploy frontend ---
echo "Building frontend..."
npm install
npm run build

echo "Syncing frontend to S3..."
aws s3 sync /Users/sohampatil/Documents/Rewear/rewear-frontend/build/ s3://rewear-frontend-bucket --delete

# --- Invalidate CloudFront cache ---
if [ -n "$FRONTEND_CLOUDFRONT" ] && [ "$FRONTEND_CLOUDFRONT" != "None" ]; then
  echo "Invalidating CloudFront cache..."
  DISTRIBUTION_ID=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?DomainName=='$FRONTEND_CLOUDFRONT'].Id | [0]" \
    --output text 2>/dev/null || true)
  if [ -n "$DISTRIBUTION_ID" ] && [ "$DISTRIBUTION_ID" != "None" ]; then
    aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*" || true
    echo "✅ CloudFront cache invalidated"
  fi
fi

# --- Monitoring stack ---
echo "Deploying monitoring stack..."
kubectl create namespace monitoring >/dev/null 2>&1 || true
kubectl apply -f k8s/prometheus/ -n monitoring || true
kubectl apply -f k8s/grafana/ -n monitoring || true

# --- Cluster Autoscaler ---
echo "Installing Cluster Autoscaler..."
helm repo add autoscaler https://kubernetes.github.io/autoscaler || true
helm repo update
helm upgrade --install cluster-autoscaler autoscaler/cluster-autoscaler \
  --namespace kube-system \
  --set autoDiscovery.clusterName="$CLUSTER_NAME" \
  --set awsRegion="$REGION" \
  --set rbac.create=true \
  --set replicaCount=1 || true

echo "=========================================="
echo "✅ Deployment complete!"