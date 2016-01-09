var async = require('async');
var crypto = require('crypto');
var fs = require('fs');
var parse_appcache_manifest = require('parse-appcache-manifest');
var path = require('path');

(function() {
'use strict';

function get_files_from_manifest(manifest) {
	var tokens = parse_appcache_manifest(manifest).tokens;
	var files = [];
	var mode;
	tokens.forEach(function(token) {
		if (token.type == 'mode') {
			mode = token.value;
		} else if ((token.type == 'data') && (mode == 'CACHE')) {
			files.push.apply(files, token.tokens);
		}
	});
	return files;
}

function hash_file(fn, cb) {
	var cb_called = false;
	var hash = crypto.createHash('sha512');
	var stream = fs.ReadStream(fn);
	stream.on('data', function(d) {
		hash.update(d);
	});
	stream.on('end', function() {
		if (cb_called) {
			return;
		}
		cb_called = true;

		cb(null, hash.digest('hex'));
	});
	stream.on('error', function(err) {
		if (cb_called) {
			return;
		}
		cb_called = true;
		cb(err);
	});
}

function hash_string(s) {
	var hash = crypto.createHash('sha512');
	return hash.update(s).digest('hex');
}

function main() {
	var args = process.argv.slice(2);
	var dist_dir = args[0];
	var in_file = args[1];
	var out_file = args[2];

	async.waterfall([function(cb) {
		fs.readFile(in_file, {encoding: 'utf8'}, cb);
	}, function(manifest_in, cb) {
		var files = get_files_from_manifest(manifest_in);
		async.map(files, function(fn, cb) {
			hash_file(path.join(dist_dir, fn), cb);
		}, function(err, checksums) {
			var single_checksum = hash_string(checksums.join(' '));
			var manifest = manifest_in.replace('@checksum', single_checksum);
			cb(err, manifest);
		});
	}, function(manifest, cb) {
		fs.writeFile(out_file, manifest, cb);
	}], function(err) {
		if (err) {
			throw err;
		}
	});
}

main();

})();