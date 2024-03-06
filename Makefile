.PHONY: all web wasm clean

all: web wasm

web: wasm
	$(MAKE) -C web build

wasm:
	$(MAKE) -C wasm build

clean:
	$(MAKE) -C wasm clean
	$(MAKE) -C web clean
