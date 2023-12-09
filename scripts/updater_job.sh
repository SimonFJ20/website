#!/bin/sh

git fetch

git diff origin --quiet

if [ $? -ne 0 ]; then
    git pull
    sh scripts/publish_nginx.sh
fi

