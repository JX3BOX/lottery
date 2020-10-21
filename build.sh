#!/usr/bin/env bash
set -e
version=$(git describe --tags)
buildTime=$(date '+%Y-%m-%d %H:%M:%S')
echo version:$version
echo buildTime:$buildTime
argsVersion="main.Version=$version"
argsBuildTime="main.BuildTime=$buildTime"
# env GOOS=linux GOARCH=amd64 
go build -o app -mod=vendor -ldflags="-X '$argsVersion' -X '$argsBuildTime'"