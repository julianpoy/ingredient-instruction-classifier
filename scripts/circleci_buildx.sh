export DOCKER_CLI_EXPERIMENTAL=enabled
docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
docker context create multi-arch-build
docker buildx create --use multi-arch-build
sh ./build_push_docker.sh
