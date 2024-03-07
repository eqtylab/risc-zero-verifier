.PHONY: build clean

default: build

node_modules:
	yarn install && touch $@

build: node_modules
	yarn build

clean:
	rm -rf ./node_modules
