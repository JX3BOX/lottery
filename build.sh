#!/usr/bin/env bash
set -e
version=$(git describe --tags)
buildTime=$(date '+%Y-%m-%d %H:%M:%S')
echo version:$version
echo buildTime:$buildTime
argsVersion="main.Version=$version"
argsBuildTime="main.BuildTime=$buildTime"
rm -rf release
mkdir -p release/linux
mkdir -p release/mac
mkdir -p release/win64
env GOOS=windows GOARCH=amd64  go build -o release/win64/app.exe -mod=vendor -ldflags="-X '$argsVersion' -X '$argsBuildTime'"
env GOOS=linux GOARCH=amd64   go build -o release/linux/app -mod=vendor -ldflags="-X '$argsVersion' -X '$argsBuildTime'"
env GOOS=darwin GOARCH=amd64  go build -o release/mac/app -mod=vendor -ldflags="-X '$argsVersion' -X '$argsBuildTime'"
cd web-src
yarn install
yarn build
cp -r build ../release/win64/static
cp -r build ../release/linux/static
cp -r build ../release/mac/static
cd ..
cd release/win64
tar -czf ../win64.tar.gz .
cd ../linux
tar -czf ../linux.tar.gz .
cd ../mac
tar -czf ../mac.tar.gz .