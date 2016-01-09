default: help

help:
	@echo 'make targets:'
	@echo '  deps          Download and install all dependencies (for compiling / testing / CLI operation)'
	@echo '  dist          Create distribution files'
	@echo '  test          Run tests'
	@echo '  lint          Verify source code quality'
	@echo '  upload        Upload to demo page'
	@echo '  clean         Remove temporary files'
	@echo '  help          This message'

lint: jshint eslint

jshint:
	jshint *.js div/*.js

eslint:
	eslint *.js div/*.js

deps:
	(node --version && npm --version) >/dev/null 2>/dev/null || sudo apt-get install nodejs npm
	npm install

dist: clean
	mkdir -p dist/refrath-gegen/
	cp favicon.png dist/refrath-gegen/favicon.png
	cp div/dist_htaccess dist/refrath-gegen/.htaccess
	cp div/dist_public dist/.public
	cp div/dist_upload_config.json dist/.upload_config.json
	cp refrath-gegen.html dist/refrath-gegen/refrath-gegen.html
	cleancss --rounding-precision 9 refrath-gegen.css -o dist/refrath-gegen/refrath-gegen.css
	uglifyjs --compress --mangle --screw-ie8 refrath-gegen.js -o dist/refrath-gegen/refrath-gegen.js
	node div/make_manifest.js dist/refrath-gegen/ div/refrath-gegen.appcache.in dist/refrath-gegen/refrath-gegen.appcache

upload: dist
	$(MAKE) upload-upload

upload-upload:
	cd dist/ && upload

clean:
	rm -rf dist

.PHONY: default dist upload clean lint jshint eslint help deps
