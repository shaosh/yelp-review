var http = require('http'),
	request = require('request'),
	Q = require('q'),
	cacher = require('./cacher.js');

var crawler = function(){};

crawler.prototype.get = function(url, bizId){
	var defer = Q.defer();
	cacher.get(bizId).then(
		function(content){
			if(content){
				defer.resolve(content);
				return;
			}

			var option = {};			
			url = url + bizId;
			option = {
				url: url,
				method: 'GET'
			}

			request(option, function(err, response, body){
				if(err) {
					console.log('crawler.get request ERROR:', err, 'on', bizId);
					defer.reject('crawler.get request ERROR:', err, 'on', bizId);
					return;
				};
				if(response && response.statusCode === 200){
					cacher.put(bizId, body).then(
						function(){
							defer.resolve(body);
						},
						function(e){
							console.log('crawler.get cacher.put ERROR:', e, 'on', bizId);
							defer.reject('crawler.get cacher.put ERROR:', e, 'on', bizId);
							return;
						}
					)
				}
				else if(response && response.statusCode !== 200){
					console.log('crawler.get request ERROR:', 'Invalid status code', 'on', bizId, ':', response.statusCode);
					defer.reject('crawler.get request ERROR:', 'Invalid status code', 'on', bizId, ':', response.statusCode);
					return;
				}
				else{
					console.log('crawler.get request ERROR:', 'Invalid response', 'for', bizId, ':', option);
					defer.reject('crawler.get request ERROR:', 'Invalid response', 'for', bizId, ':', option);
					return;
				}
			});
		},
		function(e){
			console.log('crawler.get ERROR:', e.toString(), 'on', bizId);
			defer.reject('crawler.get ERROR:', e.toString(), 'on', bizId);
		}
	);
	return defer.promise;
};

module.exports = new crawler();