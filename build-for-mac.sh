#!/usr/bin/env bash
set -e
version=$(git describe --tags)
buildTime=$(date '+%Y-%m-%d %H:%M:%S')
echo version:$version
echo buildTime:$buildTime
argsVersion="main.Version=$version"
argsBuildTime="main.BuildTime=$buildTime"
rm -rf release
mkdir -p release/mac
env GOOS=darwin GOARCH=amd64  go build -o release/mac/app -mod=vendor -ldflags="-X '$argsVersion' -X '$argsBuildTime'"
cd web-src
yarn install
yarn build
cp -r build ../release/mac/static