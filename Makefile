.PHONY: all web wasm clean

all: react web wasm

react: wasm
	$(MAKE) -C wasm build

wasm:
	$(MAKE) -C wasm build

web: react
	$(MAKE) -C web build

clean:
	$(MAKE) -C react clean
	$(MAKE) -C wasm clean
	$(MAKE) -C web clean
