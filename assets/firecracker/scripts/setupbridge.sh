#!/bin/bash

# prepares a bridge on the host OS such that firecracker vm's
# can grab an ip address via dhcp and have internet access

OUT_I="ens33"
BRIDGE_I="br0"

# bridge
sudo ip link add name $BRIDGE_I type bridge
sudo ip addr add 172.16.37.1/24 dev $BRIDGE_I
sudo ip link set dev $BRIDGE_I up

# ip fwd
sudo sysctl -w net.ipv4.ip_forward=1

# traffic from bridge (taps) -> out
sudo iptables -t nat -A POSTROUTING -o $OUT_I -j MASQUERADE
sudo iptables -A FORWARD -i $BRIDGE_I -o $OUT_I -j ACCEPT
sudo iptables -A FORWARD -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT

# add a tap
sudo ip link del tap0 2> /dev/null || true
sudo ip tuntap add dev tap0 mode tap
sudo brctl addif $BRIDGE_I tap0
sudo ifconfig tap0 up

# setup dnsmasq

echo << EOF > /etc/dnsmasq.d/dhcp.conf
interface=$BRIDGE_I
dhcp-range=172.16.37.2,172.16.37.254,255.255.255.0,1h
dhcp-option=3,172.16.37.1
dhcp-option=6,1.1.1.1
log-facility=/var/log/dnsmasq.log
log-async
log-queries
log-dhcp
EOF