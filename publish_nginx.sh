#!/bin/sh

set -xe

sh build.sh

sudo rm -rf /var/www/html
sudo cp build /var/www/html -r

