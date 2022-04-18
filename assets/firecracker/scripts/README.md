# interface config

## bridge

A bridge should be configured on the host where tap interfaces will be added. The bridge itself should host a DHCP server via dnsmasq. The configuration for both of these is done in the `setupbridge.sh` script. You'll need to install & start dnsmasq beforehand.

## interfaces

the bot needs to quickly add / remove interfaces. for that, scripts are written and need the ability to run as root to exec. these scripts need to run as root.

sample sudoers:

```text
leonjza ALL=(root) NOPASSWD:/home/leonjza/dbot/assets/firecracker/scripts/addtap.sh *
leonjza ALL=(root) NOPASSWD:/home/leonjza/dbot/assets/firecracker/scripts/deltap.sh *
```