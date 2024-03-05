.PHONY: all wasm clean

default: all

all: wasm

wasm:
	$(MAKE) -C wasm

clean:
	$(MAKE) -C wasm clean
