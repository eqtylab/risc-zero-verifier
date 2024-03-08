.PHONY: build clean

default: build

node_modules: package.json
	yarn install && touch $@

build: node_modules
	yarn build

start: build
	yarn start

clean:
	rm -rf ./node_modules ./dist
