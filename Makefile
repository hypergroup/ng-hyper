JS_FILES = $(shell find directives -type f -name '*.js')

all: build

build: $(JS_FILES)
	@component build --standalone ng-hyper

components: component.json
	@component install

clean:
	rm -fr build components template.js

.PHONY: clean all
