
build: components index.js
	@component build --standalone ng-hyper

components: component.json
	@component install

clean:
	rm -fr build components template.js

.PHONY: clean
