#!/usr/bin/env bash
set -e
version=$(git describe --tags)
buildTime=$(date '+%Y-%m-%d %H:%M:%S')
echo version:$version
echo buildTime:$buildTime
argsVersion="main.Version=$version"
argsBuildTime="main.BuildTime=$buildTime"

env GOOS=windows GOARCH=amd64  go build -o app.exe -mod=vendor -ldflags="-X '$argsVersion' -X '$argsBuildTime'"
env GOOS=linux GOARCH=amd64  go build -o app.linux.amd64 -mod=vendor -ldflags="-X '$argsVersion' -X '$argsBuildTime'"
go build -o app.mac -mod=vendor -ldflags="-X '$argsVersion' -X '$argsBuildTime'"