# yelp-review
A REST API to fetch Yelp Review built with Nodejs and Express

How to start:

		npm start
How to run it in Openstack even when SSH is disconnected:
```
nohup `npm start` &
```

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

  if there is new review:
		
		"data": [{
			id: string,
			commentId: string,
			rating: number,
			date: string,
			comment: string,
			avatarLink: string,
			author: string
		}]
	
  else:
		
		"data": null

End Point 4: Monitor review change 

		/yelp/:business_id/monitor

Return: 
    
    boolean		

End Point 5: Get both business info and all reviews 

		/yelp/:business_id/init

Return: 
    
    Combination of responses of End Point 1 and End Point 2		

Reference: 

		https://www.yelp.com/developers/documentation/v2/business
