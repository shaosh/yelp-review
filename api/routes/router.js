var express = require('express');
var Q = require('q');
var router = express.Router();
var yelpApi = require('../socialmedias/yelp');
var yelpCrawler = require('../crawlers/yelp');
var request = require('request');

function analyseComment(data, res) {
  console.log('call func analyseComment');

  //Lets configure and request
  request({
    url:'http://127.0.0.1:5000/api/nlp',
    method: 'POST',
    //Lets post the following key/values as form
    json: {
      data: data
    }
  }, function(error, response, body){
    if(error) {
      console.log(error);

    } else {
      console.log(response.statusCode, body);
      res.send( {data: body.data} );
    }
  });
}

router.get('/yelp/:business_id/init', function(req, res) {	
	if(!req.params.business_id){
		res.send({error: 'Empty business_id'});
		return;
	}

	var deferInfo = Q.defer();
	var deferReviews = Q.defer();

	var getInfo = function(){
		yelpApi.findBusiness(req.params.business_id, false, function(err, data){			
			if(err){
				deferInfo.reject({error: err});
			}
			else{
				deferInfo.resolve({id: 'getInfo', data: data});
			}
		});
		return deferInfo.promise; 	
	};

	var getReviews = function(){
		yelpApi.monitor(req.params.business_id, function(err, changed){
			if(err){
				res.send({error: err});
			}
			else{
				yelpCrawler.getReview(req.params.business_id, true, changed).then(
					function(data){
						deferReviews.resolve({id: 'getReviews', data: data});		
					},
					function(err){
						deferReviews.reject({error: err});
					}
				);
			}
		});	
		return deferReviews.promise; 	
	};

	Q.allSettled([getInfo(), getReviews()]).then(
		function(results){
			var obj = {};
			results.forEach(function(result){
				if(result.state === 'fulfilled'){
					var value = result.value;
					if(value.id === 'getInfo'){
						obj.info = value.data;
					}
					else{
						obj.reviews = value.data;
					}
				}
			});
			res.json({data: obj});
		},function(errs){
			res.send({error: err});
		});
});

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

router.get('/yelp/:business_id/monitor', function(req, res) {	
	if(!req.params.business_id){
		res.send({error: 'Empty business_id'});
		return;
	}

	yelpApi.monitor(req.params.business_id, function(err, changed){
		if(err){
			res.send({error: err});
		}
		else{
			res.send(changed);
		}
	}); 	
});

router.get('/yelp/:business_id/lastreview', function(req, res) {	
	if(!req.params.business_id){
		res.send({error: 'Empty business_id'});
		return;
	}

	yelpApi.monitor(req.params.business_id, function(err, changed){
		if(err){
			res.send({error: err});
		}
		else{
			if(changed){
				yelpCrawler.getReview(req.params.business_id, false, changed).then(
					function(data){
						res.send({data: data});			
					},
					function(err){
						res.send({error: err});
					}
				);
			}
			else{
				res.send({data: null});
			}			
		}
	});		
});

router.get('/yelp/:business_id/reviews', function(req, res) {	
	if(!req.params.business_id){
		res.send({error: 'Empty business_id'});
		return;
	}

	yelpApi.monitor(req.params.business_id, function(err, changed){
		if(err){
			res.send({error: err});
		}
		else{
			yelpCrawler.getReview(req.params.business_id, true, changed).then(
				function(data){
          analyseComment(data, res);
				},
				function(err){
					res.send({error: err});
				}
			);
		}
	});	
});

module.exports = router;
