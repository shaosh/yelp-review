var express = require('express');
var request = require('request');
var oauthSignature = require('oauth-signature');
var n = require('nonce')();  
var qs = require('querystring');  
var _ = require('lodash');
var router = express.Router();

/* GET home page. */
var urlBase = 'http://api.yelp.com/v2/business/';

var yelpConsumerKey = 'EhTkTCv9eYm6FasVNb1wAw';
var yelpConsumerSecret = '2blae3e_5mjmCKhxUehxgWK9Ojw';
var yelpToken = 'XgKX6d7mK6oopPohWdnhlYla3Z8IaufF';
var yelpTokenSecret = '_Z-uhW1cf5xOPQLUoixzASSy_YA'; 


router.get('/yelp/:business_id', function(req, res) {	
	if(!req.params.business_id){
		res.send({error: 'business_id is null or empty'});
	}

	var apiUrl = urlBase + req.params.business_id;
	console.log('apiUrl', apiUrl);

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

  var params = required_params;
  params.oauth_signature = signature;

  var paramUrl = qs.stringify(params);
  var url = apiUrl + '?' + paramUrl;

	request(url, function(err, response, body){
		if(!err && response.statusCode === 200){
			res.json({body: body});
		}
		else if(err){
			res.send({error: 'Yelp API Error: ' + JSON.stringify(err)});
		}
		else{
			res.send({error: 'Yelp API Response: ' + JSON.stringify(response)});
		}
	});
});

module.exports = router;
