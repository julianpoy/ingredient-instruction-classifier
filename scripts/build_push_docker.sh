#!/bin/sh

docker build . -t julianpoy/ingredient-instruction-classifier:latest -t julianpoy/ingredient-instruction-classifier:$1

docker push julianpoy/ingredient-instruction-classifier:$1
docker push julianpoy/ingredient-instruction-classifier:latest
