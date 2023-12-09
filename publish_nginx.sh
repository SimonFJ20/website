#!/bin/sh

set -xe

sh build.sh

cp build /var/www/html -r

