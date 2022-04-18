#!/bin/bash
set -e

TAP_NAME=$1
BRIDGE_I="br0"

echo "i| configuring tap $TAP_NAME"

ip link del $TAP_NAME 2> /dev/null || true
ip tuntap add dev $TAP_NAME mode tap
brctl addif $BRIDGE_I $TAP_NAME
ifconfig $TAP_NAME up

echo "i| tap $TAP_NAME configured"
