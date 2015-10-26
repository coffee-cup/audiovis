#!/bin/sh

if [ $(ps -e -o uid,cmd | grep $UID | grep node | grep -v grep | wc -l | tr -s "\n") -eq 0 ]
then

        export APP_ENV="production"
        export SRC_DIR="/var/www/visualizer/"
        export PATH=/usr/local/bin:$PATH
        export ROOT_URL='http://visualizer.jakerunzer.xyz'
        export PORT=8000

        echo "Stopping current forever process"
        forever stop "$SRC_DIR"server.js

        echo "Starting forever process"
        forever --sourceDir "$SRC_DIR" -l "$SRC_DIR"logs/forever.log -o "$SRC_DIR"logs/out.log -e "$SRC_DIR"logs/error.log -a start server.js
fi
