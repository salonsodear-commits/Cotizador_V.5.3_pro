# Infraestructura AWS — Cotizador V5.3 PRO

Plantilla CloudFormation para publicar el cotizador como sitio estático en
**Amazon S3** con distribución opcional vía **CloudFront (HTTPS)**.

## Recursos provisionados

- `AWS::S3::Bucket` con hosting estático habilitado (index + error → `index.html`).
- `AWS::S3::BucketPolicy` permitiendo `s3:GetObject` público.
- `AWS::CloudFront::Distribution` (condicional) redirigiendo HTTP → HTTPS y
  manejando rutas SPA (403/404 → `/index.html`).

## Despliegue del stack

```bash
# 1) Crear el stack (primera vez)
aws cloudformation create-stack \
  --stack-name cotizador-v53-pro \
  --template-body file://infrastructure/s3-static-site.yml \
  --parameters \
      ParameterKey=BucketName,ParameterValue=cotizador-v53-pro-prod \
      ParameterKey=EnableCloudFront,ParameterValue=true \
  --region us-east-1

# 2) Esperar a que termine
aws cloudformation wait stack-create-complete \
  --stack-name cotizador-v53-pro --region us-east-1

# 3) Obtener outputs (bucket, URL, distribution ID)
aws cloudformation describe-stacks \
  --stack-name cotizador-v53-pro \
  --query 'Stacks[0].Outputs' --region us-east-1
```

## Actualizar el stack

```bash
aws cloudformation update-stack \
  --stack-name cotizador-v53-pro \
  --template-body file://infrastructure/s3-static-site.yml \
  --parameters \
      ParameterKey=BucketName,UsePreviousValue=true \
      ParameterKey=EnableCloudFront,UsePreviousValue=true
```

## Parámetros

| Parámetro          | Default      | Descripción                                    |
| ------------------ | ------------ | ---------------------------------------------- |
| `BucketName`       | —            | Nombre global único del bucket S3              |
| `EnableCloudFront` | `true`       | Provisiona distribución CloudFront con HTTPS   |
| `IndexDocument`    | `index.html` | Documento índice                               |
| `ErrorDocument`    | `index.html` | Documento de error (SPA fallback)              |

## Costos aproximados (us-east-1)

- S3: ~$0.023/GB-mes de almacenamiento + $0.0004 por 1k GETs.
- CloudFront: primeros 1 TB/mes gratuitos en la capa free tier de AWS.

## Limpieza

El bucket tiene `DeletionPolicy: Retain` para evitar pérdidas accidentales.
Para destruir todo:

```bash
aws s3 rm s3://cotizador-v53-pro-prod --recursive
aws s3 rb s3://cotizador-v53-pro-prod
aws cloudformation delete-stack --stack-name cotizador-v53-pro
```
