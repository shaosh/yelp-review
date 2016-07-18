# yelp-review
A REST API to fetch Yelp Review built with Nodejs and Express

How to start:

		npm start

End Point: Get business review by business_id 

		/yelp/:business_id

Return:
		
		"data": {
			"rating": number,
			"comment": string
		}

Reference: 

		https://www.yelp.com/developers/documentation/v2/business
