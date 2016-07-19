# yelp-review
A REST API to fetch Yelp Review built with Nodejs and Express

How to start:

		npm start

End Point 1: Get business info by business_id 

		/yelp/:business_id/info

Return: 
    
    https://www.yelp.com/developers/documentation/v2/business		


End Point 2: Get business reviews by business_id 

		/yelp/:business_id/reviews

Return:

		"data": [{
			id: string,
			commentId: string,
			rating: number,
			date: string,
			comment: string,
			avatarLink: string,
			author: string
		}, {
			id: string,
			commentId: string,
			rating: number,
			date: string,
			comment: string,
			avatarLink: string,
			author: string
		}]


End Point 3: Get business last review by business_id 

		/yelp/:business_id/lastreview

Return:

		"data": [{
			id: string,
			commentId: string,
			rating: number,
			date: string,
			comment: string,
			avatarLink: string,
			author: string
		}]

End Point 4: Monitor review change 

		/yelp/:business_id/monitor

Return: 
    
    boolean			

Reference: 

		https://www.yelp.com/developers/documentation/v2/business
