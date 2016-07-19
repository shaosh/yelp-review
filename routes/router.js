var express = require('express');
var router = express.Router();
var yelpApi = require('../socialmedias/yelp');
var yelpCrawler = require('../crawlers/yelp');

router.get('/yelp/:business_id/info', function(req, res) {	
	if(!req.params.business_id){
		res.send({error: 'Empty business_id'});
		return;
	}

	yelpApi.findBusiness(req.params.business_id, false, function(err, data){
		if(err){
			res.send({error: err});
		}
		else{
			res.json({data: data});
		}
	}); 	
});

router.get('/yelp/:business_id/lastreview', function(req, res) {	
	if(!req.params.business_id){
		res.send({error: 'Empty business_id'});
		return;
	}

	yelpCrawler.getReview(req.params.business_id, false).then(
		function(data){
			res.send({data: data});			
		},
		function(err){
			res.send({error: err});
		}
	);	
});

router.get('/yelp/:business_id/reviews', function(req, res) {	
	if(!req.params.business_id){
		res.send({error: 'Empty business_id'});
		return;
	}

	yelpCrawler.getReview(req.params.business_id, true).then(
		function(data){
			res.send({data: data});			
		},
		function(err){
			res.send({error: err});
		}
	);	
});

module.exports = router;
