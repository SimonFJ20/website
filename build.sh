#!/bin/sh

set -xe

mkdir -p build

cp public/* build/ -r

find articles/ -name "*.html" | xargs deno run --allow-read --allow-write article_generator.ts

