#!/usr/bin/env bash
# -*- coding: utf-8 -*-

if [ ! -f caddy ]; then
    if [ "$OS" == "" ] || [ "$ARCH" == "" ]; then
        echo "OS and ARCH not set"
        exit 1
    fi

    curl -o caddy "https://caddyserver.com/api/download?os=$OS&arch=$ARCH&p=github.com%2Fcaddyserver%2Freplace-response"
    chmod +x caddy
fi

./caddy start
