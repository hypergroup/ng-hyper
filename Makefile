
DOCS = public/index.md
STYLES = public/stylesheets/style.css

index.html: views/index.jade $(DOCS)
	@./node_modules/.bin/jade $< -Po .

public/stylesheets/style.css: public/stylesheets/style.styl
	@./node_modules/.bin/stylus $<

build/build.js:
	@component build

clean:
	rm -fr *.html $(DOCS)

.PHONY: clean
