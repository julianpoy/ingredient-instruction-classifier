#!/bin/sh

export DOCKER_BUILD_KIT=1
export DOCKER_CLI_EXPERIMENTAL=enabled

wget https://github.com/docker/buildx/releases/download/v0.4.1/buildx-v0.4.1.linux-amd64
chmod a+x buildx-v0.4.1.linux-amd64
mkdir -p ~/.docker/cli-plugins
mv buildx-v0.4.1.linux-amd64 ~/.docker/cli-plugins/docker-buildx

docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
docker context create multi-arch-build
docker buildx use multi-arch-build

DIR="$(cd "$(dirname "$0")" && pwd)"
sh $DIR/build_push_docker.sh $1
