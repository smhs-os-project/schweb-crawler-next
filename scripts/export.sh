#!/usr/bin/env bash
# -*- coding: utf-8 -*-

script_dirname=$(dirname "$0")

echo "正在整理爬蟲資料⋯⋯"

pushd "$script_dirname" || exit
mkdir -p ./output/announcements

cp ../apify_storage/datasets/announcements/*.json ./output/announcements
cp ../apify_storage/key_value_stores/index-store/*.json ./output
node create-readme.js

echo "整理完成。"
