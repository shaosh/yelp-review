var cheerio = require('cheerio'),
	Q = require('q'),
	crypto = require('crypto');

var parser = function(){};

parser.prototype.parse = function(content, bizId, all){
	var $ = cheerio.load(content);
	var reviewContents = $('div.review.review--with-sidebar:not(.js-war-widget)');
	var reviews = [];
	if(reviewContents.length > 0){
		if(all){			
			for(var i = 0; i < reviewContents.length; i++){				
				var content = $(reviewContents[i]);
				var review = buildReview(content, bizId);
				reviews.push(review);
			}
		}
		else{			
			var lastContent = $(reviewContents[0]);
			var review = buildReview(lastContent, bizId);
			reviews.push(review);
		}		
		return reviews;
	}	
	return null;
}

var buildReview = function(content, bizId){
	var review = {
		id: bizId,
		commentId: '',
		rating: -1,
		date: '',
		comment: '',
		avatarLink: '',
		author: ''
	};
	review.commentId = content.attr('data-review-id') || '';
	review.rating = parseFloat(content.find('meta[itemprop="ratingValue"]').attr('content')) || -1;
	review.date = content.find('meta[itemprop="datePublished"]').attr('content') || '';
	review.comment = content.find('p[itemprop="description"]').text() || '';
	review.avatarLink = content.find('img.photo-box-img').attr('src') || '';
	review.author = content.find('meta[itemprop="author"]').attr('content') || '';
	return review;
}

module.exports = new parser();