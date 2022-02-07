#!/bin/sh

export DOCKER_BUILD_KIT=1
export DOCKER_CLI_EXPERIMENTAL=enabled
docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
docker context create multi-arch-build
docker buildx use multi-arch-build

DIR="$(cd "$(dirname "$0")" && pwd)"
sh $DIR/build_push_docker.sh $1
