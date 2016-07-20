var crawler = require('./crawler.js'),
	cacher = require('./cacher.js'),
	parser = require('./parser.js'),
	cheerio = require('cheerio'),
	mkdirp = require('mkdirp'),
	Q = require('q'),
  moment = require('moment');

const urlBase = 'http://www.yelp.com/biz/';

var bizMap = bizMap || {};

var getReview = function(bizId, allReviews, changedFromCache){
	var defer = Q.defer();
	crawler.get(urlBase, bizId, changedFromCache).then(
		function(content){
			var reviews = parser.parse(content, bizId, allReviews);			
			if(!reviews){
				defer.resolve(null);
				return;
			}
			var prevReview = bizMap[bizId];
			if(!prevReview){
				bizMap[bizId] = reviews;
			}
			if(!allReviews){
				var review = reviews[0];
				if(!review.commentId || (prevReview && prevReview.commentId === review.commentId) || !isFresh(review.date)){
					defer.resolve(null);
					return;
				}
				bizMap[bizId] = reviews.concat(bizMap[bizId]);
				defer.resolve(reviews);
			}
			else{
				var lastPrevReview = bizMap[bizId][0];
				var firstCurrReview = reviews[reviews.length - 1];
				var lastCurrReview = reviews[0];
				var diff = moment(firstCurrReview.date).diff(moment(lastPrevReview.date));
				if(diff > 0){
					bizMap[bizId] = reviews.concat(bizMap[bizId]);
				}
				else if(lastCurrReview.commentId !== lastPrevReview.commentId || bizMap[bizId].length !== reviews.length){					
					var hash = {};
					for(var i = 0; i < reviews.length; i++){
						hash[reviews[i].commentId] = true;
					}

					var index = -1;
					for(var i = 0; i < bizMap.length; i++){
						if(hash[bizMap[bizId][i].commentId]){
							reviews.push(bizMap[bizId][i]);
						}
					}
					bizMap[bizId] = reviews;
				}
				defer.resolve(bizMap[bizId]);
			}
			return;			
		},
		function(e){
			console.log('getReview crawler.get ERROR:', e);			
			defer.reject('getReview crawler.get ERROR:', e);
			return;
		}
	)
	return defer.promise;
};

var isFresh = function(date){
	if(!date || !moment(date).isValid()){
		return false;
	}
	var reviewDate = moment(date);
	var yesterday = moment(new Date()).subtract(1, 'days');
	var diff = reviewDate.diff(yesterday, 'days');
	return diff >= 0;
};

module.exports = {getReview: getReview};