# local.d

This directory explains the directory structure for the Alpine filesystem in the Firecracker VM to serve the WASM challenge.

Inside the `/etc/local.d` directory, the following filesystem layout should be set:

```text
leonjza@sensecon:~/mnt/etc/local.d$ ls -lh
total 4.1M
-rw-r--r-- 1 root root  652 Jun 21  2018 README
-rwxr-xr-x 1 root root 2.1K Aug 24 13:59 libsec.wasm
-rw-r--r-- 1 root root 2.7M Aug 24 13:59 main.js
-rwxr-xr-x 1 root root 1.4M Aug 24 13:59 main.wasm
-rwxr-xr-x 1 root root  261 Aug 24 14:54 runwasm.start
lrwxrwxrwx 1 root root   14 Aug 24 13:59 user.wasm -> /mnt/user.wasm
```

The `main.js`, `main.wasm` and `libsec.wasm` files are the build artefacts from the parent directory when you run `make`. The `runwasm.start` is a shell script that is started using `rc-update add local`.
