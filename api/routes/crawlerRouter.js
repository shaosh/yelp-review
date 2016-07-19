var express = require('express');
var router = express.Router();
var yelp = require('../crawlers/yelp');

router.get('/yelp/:business_id', function(req, res) {	
	if(!req.params.business_id){
		res.send({error: 'Empty business_id'});
		return;
	}

	yelp.getReview(req.params.business_id).then(
		function(data){
			res.send({data: data});			
		},
		function(err){
			res.send({error: err});
		}
	);	
});

module.exports = router;
