#!/bin/sh

set -e

docker buildx build . \
  --push \
  --platform linux/arm/v7,linux/arm64/v8,linux/amd64 \
  -t julianpoy/ingredient-instruction-classifier:latest \
  -t julianpoy/ingredient-instruction-classifier:$1

