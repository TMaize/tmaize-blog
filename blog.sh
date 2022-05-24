#!/bin/bash

if test "$1" = "run"; then
  port=8080
  if [ $2 ]; then
    port=$2
  fi
  bundle exec jekyll serve --watch --host=0.0.0.0 --port=$port
elif test "$1" = "build"; then
  bundle exec jekyll build --destination=dist
elif test "$1" = "deploy"; then
  bundle exec jekyll build --destination=dist
  cos-upload local:./dist blog:/
  curl -fL -u freshCDN "https://cloud.page404.cn/api/fresh-cdn/"
else
  echo "error param"
fi
