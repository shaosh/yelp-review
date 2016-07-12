var request = require('request');
var oauthSignature = require('oauth-signature');
var n = require('nonce')();  
var qs = require('querystring');  
var _ = require('lodash');

var urlBase = 'http://api.yelp.com/v2/business/';

var yelpConsumerKey = 'EhTkTCv9eYm6FasVNb1wAw';
var yelpConsumerSecret = '2blae3e_5mjmCKhxUehxgWK9Ojw';
var yelpToken = 'XgKX6d7mK6oopPohWdnhlYla3Z8IaufF';
var yelpTokenSecret = '_Z-uhW1cf5xOPQLUoixzASSy_YA'; 

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
			return callback('Error: Empty bizId');
		}
		
		var url = createUrl(bizId);
		request(url, function(err, response, body){
			if(!err && response.statusCode === 200){
				if(body){
					body = JSON.parse(body);
				}
				else{
					return callback('Yelp API Body: Empty body');
				}
				if(reviewOnly && body.reviews && body.reviews.length){
					return callback(null, {data: body.reviews[0]});
				}
				else if(reviewOnly){
					return callback(null, {data: 0});
				}
				return callback(null, {data: body});
			}
			else if(err){
				return callback('Yelp API Error: ' + JSON.stringify(err));
			}
			else{
				return callback('Yelp API Response: ' + JSON.stringify(response));
			}
		});
	}
};

module.exports = yelp;