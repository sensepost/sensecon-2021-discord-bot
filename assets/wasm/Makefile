PWD := $(shell pwd)
EMSCRIPTEN := docker run --rm -v $(PWD):/src -u $(id -u):$(id -g) emscripten/emsdk emcc

default: clean side libsec main

clean:
	$(RM) build/*
	go clean -x

main:
	$(EMSCRIPTEN) main.c -s MAIN_MODULE=1 -s WARN_ON_UNDEFINED_SYMBOLS=0 --pre-js pre.js -o build/main.js

libsec:
	$(EMSCRIPTEN) libsec.c -s SIDE_MODULE=1 -o build/libsec.wasm

side:
	$(EMSCRIPTEN) user.c -s SIDE_MODULE=1 -o build/user.wasm
