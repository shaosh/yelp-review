var cheerio = require('cheerio'),
	Q = require('q'),
	crypto = require('crypto');

var parser = function(){};

parser.prototype.parse = function(content, bizId){
	var $ = cheerio.load(content);
	var lastReview = {
		commentId: '',
		rating: -1,
		date: '',
		comment: ''
	};
	var reviewContents = $('div.review.review--with-sidebar:not(.js-war-widget)');
	if(reviewContents.length > 0){
		lastReview.id = bizId;
		var lastContent = $(reviewContents[0]);
		lastReview.commentId = lastContent.attr('data-review-id');
		lastReview.rating = parseFloat(lastContent.find('meta[itemprop="ratingValue"]').attr('content'));
		lastReview.date = lastContent.find('meta[itemprop="datePublished"]').attr('content');
		lastReview.comment = lastContent.find('p[itemprop="description"]').text();
	}
	return lastReview;
}

module.exports = new parser();