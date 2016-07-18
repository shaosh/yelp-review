var express = require('express');
var router = express.Router();
var yelp = require('../socialmedias/yelp');

router.get('/yelp/:business_id', function(req, res) {	
	if(!req.params.business_id){
		res.send({error: 'Empty business_id'});
		return;
	}

	yelp.findBusiness(req.params.business_id, false, function(err, data){
		if(err){
			res.send({error: err});
		}
		else{
			res.json({data: data});
		}
	}); 	
});

router.get('/yelp/review/:business_id', function(req, res) {	
	if(!req.params.business_id){
		res.send({error: 'Empty business_id'});
		return;
	}

	yelp.findBusiness(req.params.business_id, true, function(err, data){
		if(err){
			res.send({error: err});
		}
		else{
			res.json({data: data});
		}
	}); 	
});

module.exports = router;
