#!/bin/sh

set -xe

sh build.sh

sudo cp build /var/www/html -r

