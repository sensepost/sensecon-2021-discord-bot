# fs

This directory contains the filesystems & kernel used in the firecracker based challenges. Both challenges make use of the same linux kernel saved in `vmlinux.bin`.

## wasm

The wasm challenge contains a prebuilt root fs. A player's own wasm shared library is written to a new ext4 filesystem, mounted in as `/dev/vdb`, and used in the javascript file available in the root filesystems `/etc/local.d/main.js` script to execute.

## initrd

The initrd challenge has the player supply their own custom initrd that gets added as a firecracker VM argument. The root filesystem however is encrypted, with the key disclosed in the MMDS service. The encrypted drive should be available as `/dev/vda`.
