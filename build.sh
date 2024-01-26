#!/usr/bin/env bash
set -e
version=$(git describe --tags)
buildTime=$(date '+%Y-%m-%d %H:%M:%S')
echo version:$version
echo buildTime:$buildTime
argsVersion="main.Version=$version"
argsBuildTime="main.BuildTime=$buildTime"
rm -rf release
mkdir -p release/
go build -o release/app -mod=vendor -ldflags="-X '$argsVersion' -X '$argsBuildTime'"
cd web-src
cnpm install
cnpm run build
cp -r build ../release/static