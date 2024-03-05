.PHONY: all wasm clean

default: all

all: wasm web

wasm:
	$(MAKE) -C wasm

web:
	$(MAKE) -C web

clean:
	$(MAKE) -C wasm clean
