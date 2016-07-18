var crawler = require('./crawler.js'),
	cacher = require('./cacher.js'),
	parser = require('./parser.js'),
	cheerio = require('cheerio'),
	mkdirp = require('mkdirp'),
	Q = require('q'),
  moment = require('moment');

const urlBase = 'http://www.yelp.com/biz/';

var bizMap = bizMap || {};

var getReview = function(bizId){
	var defer = Q.defer();

	crawler.get(urlBase, bizId).then(
		function(content){
			var review = parser.parse(content, bizId);			
			var prevReview = bizMap[bizId];
			if(!prevReview){
				bizMap[bizId] = review;
			}
			if(!review.commentId || (prevReview && prevReview.commentId === review.commentId) || !isFresh(review.date)){
				defer.resolve(null);
				return;
			}
			bizMap[bizId] = review;
			defer.resolve({
				rating: review.rating,
				comment: review.comment
			});
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