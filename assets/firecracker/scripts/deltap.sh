#!/bin/bash
set -e

TAP_NAME=$1

echo "i| removing tap $TAP_NAME"

ip link del $TAP_NAME

echo "i| tap $TAP_NAME removed"
