#!/usr/bin/env bash
set -euo pipefail

ENDPOINT="http://localhost:4566"
REGION="us-east-1"

create_table() {
  local table_name="$1"

  if aws --endpoint-url="$ENDPOINT" dynamodb describe-table \
    --table-name "$table_name" \
    --region "$REGION" >/dev/null 2>&1; then
    echo "Table exists: $table_name"
  else
    echo "Creating table: $table_name"
    aws --endpoint-url="$ENDPOINT" dynamodb create-table \
      --table-name "$table_name" \
      --attribute-definitions \
        AttributeName=pk,AttributeType=S \
        AttributeName=sk,AttributeType=S \
      --key-schema \
        AttributeName=pk,KeyType=HASH \
        AttributeName=sk,KeyType=RANGE \
      --billing-mode PAY_PER_REQUEST \
      --region "$REGION"
  fi
}

create_table "freelancer-ledger-clients-local"
create_table "freelancer-ledger-invoices-local"
create_table "freelancer-ledger-payments-local"

if aws --endpoint-url="$ENDPOINT" s3api head-bucket \
  --bucket "freelancer-ledger-pdfs-local" 2>/dev/null; then
  echo "Bucket exists: freelancer-ledger-pdfs-local"
else
  aws --endpoint-url="$ENDPOINT" s3 mb \
    "s3://freelancer-ledger-pdfs-local" \
    --region "$REGION"
fi

echo "Local infrastructure is ready."
