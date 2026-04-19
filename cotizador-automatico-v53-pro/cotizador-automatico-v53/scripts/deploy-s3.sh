#!/usr/bin/env bash
# Despliegue manual del Cotizador V5.3 PRO a AWS S3.
# Requiere AWS CLI v2 autenticado (aws configure / SSO / variables de entorno).
#
# Uso:
#   S3_BUCKET=mi-bucket AWS_REGION=us-east-1 ./scripts/deploy-s3.sh
#   S3_BUCKET=mi-bucket CLOUDFRONT_DISTRIBUTION_ID=E123 ./scripts/deploy-s3.sh
#   ./scripts/deploy-s3.sh --bucket mi-bucket --region us-east-1 --distribution E123
#
# Variables opcionales:
#   SKIP_BUILD=1   -> no ejecuta npm install/build (asume dist/ ya existe)

set -euo pipefail

BUCKET="${S3_BUCKET:-}"
REGION="${AWS_REGION:-us-east-1}"
DISTRIBUTION_ID="${CLOUDFRONT_DISTRIBUTION_ID:-}"
SKIP_BUILD="${SKIP_BUILD:-0}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --bucket)        BUCKET="$2"; shift 2 ;;
    --region)        REGION="$2"; shift 2 ;;
    --distribution)  DISTRIBUTION_ID="$2"; shift 2 ;;
    --skip-build)    SKIP_BUILD=1; shift ;;
    -h|--help)
      sed -n '2,15p' "$0"; exit 0 ;;
    *) echo "Opción desconocida: $1" >&2; exit 1 ;;
  esac
done

if [[ -z "${BUCKET}" ]]; then
  echo "ERROR: Falta S3_BUCKET (o --bucket)." >&2
  exit 1
fi

if ! command -v aws >/dev/null 2>&1; then
  echo "ERROR: AWS CLI no está instalado. https://aws.amazon.com/cli/" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_DIR}"

echo "==> Proyecto:   ${PROJECT_DIR}"
echo "==> Bucket:     s3://${BUCKET}"
echo "==> Región:     ${REGION}"
[[ -n "${DISTRIBUTION_ID}" ]] && echo "==> CloudFront: ${DISTRIBUTION_ID}"

if [[ "${SKIP_BUILD}" != "1" ]]; then
  echo "==> Instalando dependencias"
  if [[ -f package-lock.json ]]; then
    npm ci
  else
    npm install
  fi

  echo "==> Compilando build de producción"
  npm run build
fi

if [[ ! -d dist ]]; then
  echo "ERROR: No se encontró el directorio dist/. Ejecutá 'npm run build' primero." >&2
  exit 1
fi

echo "==> Subiendo assets estáticos (cache largo, immutable)"
aws s3 sync dist/ "s3://${BUCKET}/" \
  --region "${REGION}" \
  --delete \
  --exclude "*.html" \
  --cache-control "public,max-age=31536000,immutable"

echo "==> Subiendo HTML (sin cache)"
aws s3 sync dist/ "s3://${BUCKET}/" \
  --region "${REGION}" \
  --exclude "*" \
  --include "*.html" \
  --cache-control "public,max-age=0,must-revalidate" \
  --content-type "text/html; charset=utf-8"

if [[ -n "${DISTRIBUTION_ID}" ]]; then
  echo "==> Invalidando cache de CloudFront"
  aws cloudfront create-invalidation \
    --distribution-id "${DISTRIBUTION_ID}" \
    --paths "/*" \
    --output text --query 'Invalidation.Id'
fi

WEBSITE_URL="http://${BUCKET}.s3-website-${REGION}.amazonaws.com"
echo
echo "✔ Deploy completado"
echo "  S3 website: ${WEBSITE_URL}"
[[ -n "${DISTRIBUTION_ID}" ]] && echo "  Invalidación CloudFront enviada."
