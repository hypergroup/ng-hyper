JS_FILES = $(shell find directives services lib -type f -name '*.js')

NG_VERSION ?= 1.0.8

all: build

build: ng-hyper.js ng-hyper.min.js

ng-hyper.js: $(JS_FILES) components
	@./node_modules/.bin/component build --standalone ng-hyper
	@mv build/build.js ng-hyper.js

ng-hyper.min.js: ng-hyper.js
	@./node_modules/.bin/uglifyjs --compress --mangle -o $@ $<

components: component.json
	@./node_modules/.bin/component install

tests: ng-hyper.js vendor/angular.$(NG_VERSION).js vendor/angular-mocks.$(NG_VERSION).js
	@echo testing angular v$(NG_VERSION)
	@NG_VERSION=$(NG_VERSION) ./node_modules/.bin/karma start

vendor/angular.$(NG_VERSION).js:
	@mkdir -p vendor
	@curl http://code.angularjs.org/$(NG_VERSION)/angular.js -o $@

vendor/angular-mocks.$(NG_VERSION).js:
	@mkdir -p vendor
	@curl http://code.angularjs.org/$(NG_VERSION)/angular-mocks.js -o $@

clean:
	rm -fr build components template.js

.PHONY: clean all tests
