var request = require('request');
var oauthSignature = require('oauth-signature');
var n = require('nonce')();  
var qs = require('querystring');  
var _ = require('lodash');
var moment = require('moment');

var urlBase = 'http://api.yelp.com/v2/business/';

var yelpConsumerKey = 'EhTkTCv9eYm6FasVNb1wAw';
var yelpConsumerSecret = '2blae3e_5mjmCKhxUehxgWK9Ojw';
var yelpToken = 'XgKX6d7mK6oopPohWdnhlYla3Z8IaufF';
var yelpTokenSecret = '_Z-uhW1cf5xOPQLUoixzASSy_YA'; 

var bizHashmap = bizHashmap || {};
var bizReviewCount = {};

var createUrl = function(bizId){
	var apiUrl = urlBase + bizId;
	var required_params = {
    oauth_consumer_key : yelpConsumerKey,
    oauth_token : yelpToken,
    oauth_nonce : n(),
    oauth_timestamp : n().toString().substr(0,10),
    oauth_signature_method : 'HMAC-SHA1',
    oauth_version : '1.0'
  };
  var consumerSecret = yelpConsumerSecret;
  var tokenSecret = yelpTokenSecret;

  var signature = oauthSignature.generate('GET', apiUrl, required_params, consumerSecret, tokenSecret, {encodeSignature: false});

  required_params.oauth_signature = signature;
  var queryString = qs.stringify(required_params);
  var url = apiUrl + '?' + queryString;
  return url;
};

var yelp = {
	findBusiness: function(bizId, reviewOnly, callback){
		if(!bizId){
			return callback('Yelp API findBusiness Error: Empty bizId');
		}
		
		var url = createUrl(bizId);
		request(url, function(err, response, body){
			if(!err && response.statusCode === 200){
				if(body){
					body = JSON.parse(body);
				}
				else{
					return callback('Yelp API findBusiness Body: Empty body');
				}
				if(reviewOnly && body.reviews && body.reviews.length){
					cacheBiz(bizId, body);
					var bizObj = bizHashmap[bizId];
					if(bizObj && bizObj.review_count){
						var yesterday = moment(new Date()).subtract(1, 'days').unix();
						var diff = moment(new Date(bizObj.last_review.timestamp)).diff(new Date(yesterday), 'hours', true);
						if(diff >= 0 && diff <= 24){
							return callback(null, {rating: bizObj.last_review.rating, comment: bizObj.last_review.excerpt});
						}						
					}
					return callback(null, 0);
				}
				else if(reviewOnly){
					cacheBiz(bizId, body);
					return callback(null, 0);
				}
				return callback(null, body);
			}
			else if(err){
				return callback('Yelp API findBusiness Error: ' + JSON.stringify(err));
			}
			else{
				return callback('Yelp API findBusiness Response: ' + JSON.stringify(response));
			}
		});
	},

	monitor: function(bizId, callback){		
		this.findBusiness(bizId, false, function(err, data){
			if(err){
				return callback('Yelp API monitor Error: ' + JSON.stringify(err));
			}
			else if(!data){
				return callback('Yelp API monitor Error: Empty response');
			}
			else{
				console.log('data.review_count', data.review_count);
				if(!bizReviewCount[bizId]){
					bizReviewCount[bizId] = !data.review_count ? 0 : data.review_count;
					return callback(null, !!data.review_count);
				}
				if(bizReviewCount[bizId] !== data.review_count){
					bizReviewCount[bizId] = data.review_count;
					return callback(null, true);
				}
				return callback(null, false);				
			}
		});
	}
};

var cacheBiz = function(bizId, body){
	if(!bizHashmap[bizId]){
		bizHashmap[bizId] = {
			id: bizId,
			rating: -1,
			review_count: 0,
			last_review:{
				rating: -1,
				timestamp: 0,
				excerpt: ''
			}
		};
	}
	if(!body || !body.review_count || bizHashmap[bizId].review_count === body.review_count){
		return;
	}
	bizHashmap[bizId].rating = body.rating;
	bizHashmap[bizId].review_count = body.review_count;
	bizHashmap[bizId].last_review.rating = body.reviews[0].rating;
	bizHashmap[bizId].last_review.timestamp = body.reviews[0].time_created;
	bizHashmap[bizId].last_review.excerpt = body.reviews[0].excerpt;
}

module.exports = yelp;