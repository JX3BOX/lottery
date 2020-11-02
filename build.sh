#!/usr/bin/env bash
set -e
version=$(git describe --tags)
buildTime=$(date '+%Y-%m-%d %H:%M:%S')
echo version:$version
echo buildTime:$buildTime
argsVersion="main.Version=$version"
argsBuildTime="main.BuildTime=$buildTime"

unameOut="$(uname -s)"
case "${unameOut}" in
    Linux*)     machine=linux;;
    Darwin*)    machine=mac;;
    *)          machine="UNKNOWN:${unameOut}"
esac
rm -rf release
mkdir -p release/${machine}
mkdir -p release/win64
env CGO_ENABLED=1 CXX=x86_64-w64-mingw32-g++ CC=x86_64-w64-mingw32-gcc GOOS=windows GOARCH=amd64  go build -o release/win64/app.exe -mod=vendor -ldflags="-X '$argsVersion' -X '$argsBuildTime'"
env go build -o release/${machine}/app -mod=vendor -ldflags="-X '$argsVersion' -X '$argsBuildTime'"
cd web-src
yarn install
yarn build
cp -r build ../release/win64/static
cp -r build ../release/${machine}/static
cd ..
cd release/win64
tar -czf ../win64.tar.gz .
cd ../${machine}
tar -czf ../${machine}.tar.gz .