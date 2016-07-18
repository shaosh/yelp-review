var fs = require('fs'),
	path = require('path'),
	crypto = require('crypto'),
	mkdirp = require('mkdirp'),
	Q = require('q');

var cacheDir = './crawlers/.cache';
mkdirp.sync(cacheDir);

var qReadFile = Q.denodeify(fs.readFile);
var qWriteFile = Q.denodeify(fs.writeFile);

var cache = {
	cachePath: function hash(bizId){
		return path.join(cacheDir, bizId);
	},

	put: function(bizId, data){
		var cachePath = this.cachePath(bizId);
		var defer = Q.defer();
		return qWriteFile(cachePath, JSON.stringify(data)).then(
			function(){
				defer.resolve();
				console.log('cache.put:', bizId, 'done');
			},
			function(e){
				console.log('cache.put ERROR:', e.toString(), 'on', bizId);
				defer.reject('cache.put ERROR:', e.toString(), 'on', bizId);
			}
		)
	},

	get: function(bizId){
		var cachePath = this.cachePath(bizId);
		var defer = Q.defer();
		fs.exists(cachePath, function(exists){
			if(exists){
				//Change from async to sync because async will generate EMFILE error
				var content = fs.readFileSync(cachePath);
				if(content){
					defer.resolve(JSON.parse(content.toString()));
				}
				else{
					console.log('cache.get ERROR:', e.toString(), 'on', bizId);
					defer.reject('cache.get ERROR:', e.toString(), 'on', bizId);
				}
			}
			else{
				defer.resolve();
			}
		});
		return defer.promise;
	}
};

module.exports = cache;