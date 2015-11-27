var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;

var url = 'mongodb://localhost:27017/VGExchange';
var db;

MongoClient.connect(url, function(err, database) {
  assert.equal(null, err);
  console.log("Connected to DB");
  db = database;
});

///***************USER COLLECTION***************************
//Create
var insertUser = function(db, newUser) {
	db.collection('users').insertOne( 
	{
		"email" : newUser.email,
		"username" : newUser.username,
		"password" : password,
		"name" : "",
		"description" : "NEW USER",

	}, function(err, result) {
			    assert.equal(err, null);
			    console.log("Inserted a document into the users collection.");
	});

};

//READ
//find user <username> (does not include password in data)
var getUserByUsername = function(db, username, next){
	db.collection('users').findOne(
		{
			"username" : username
		},
		{
			"password" : 0     //does not include password field in result

		}, function(err, user){
			assert.equal(err, null);
			next(user);
		});
};
//For logging in, checks that passwords match, sends boolean to next()
var validateUser = function(db, username, password, next){
	db.collection('users').findOne(
		{
			"username" : username,
			"password" : password

		}, function(err, result){
			assert.equal(err, null);
			if (result){
				next(true);
			}else{
				next(false);
			}
		});
}
//Check if newUser's email or username is already in database,
//sends boolean to next()
var userExists = function(db, newUser, next){
	db.collection('users').findOne(
		{
			$or: [{"email": newUser.email}, {"username": newUser.username}]
		}, function(err, result) {
				assert.equal(err, null);
			    if (result){
			    	next(true);
			    }else{
			    	next(false);
			    }
		});
};

//UPDATE
//update the user <username>'s name and or description
var updateUserInfo = function(db, user){
	db.collection('users').update(
		{
			"username" : user.username
		},{
			$set{
				"name" : user.name,
				"description" : user.description
			}
		}, function(err, result) {
			assert.equal(err, null);
		});
}
//update the user <username>'s password
var updateUserPassword = function(db, username, password){
	db.collection('users').update(
		{
			"username" : username
		},{
			$set{"password" : password}
		}, function(err, result) {
			assert.equal(err, null);
		});
}

//DELETE
var deleteUser = function(db, username){
	db.collection('users').remove(
	{
		"username": username
	}, function(err, result){
		assert.equal(err, null);
	});
}

///***********************POSTS COLLECTION*******************************************
//CREATE
var insertPost = function(db, newPost){
	db.collection('posts').insertOne( 
	{
		//Idenifiers
		"username" : newPost.username,
		"id" : newPost.id, //Different than _id

		"date" : newPost.date,
		"title" : newPost.title,
		"postContent" : newPost.postContent,
		"tags" : newPost.tags,

		"available" : true,  //Set to false when game is rented/bought
		"buyer" : "" //User who buys/rents game

	}, function(err, result) {
			    assert.equal(err, null);
			    console.log("Inserted a post into the posts collection");
	});
};

//READ
//Finds a post by it's unique id
var getPostByID = function(db, postID, next){
	db.collection('posts').findOne(
		{
			"id" : postID
		}, function (err, post){
			assert.equal(err, null);
			next(post);
		});
};
//Finds all posts made by user <username>
var getPostsFrom = function(db, username, next){
	db.collection('posts').find(
		{
			"username" : username
		}, function (err, posts){
			assert.equal(err.null);
			next(posts);
		});
};
//Finds all posts where the buyer is user <username>
var getPostsBoughtBy = function(db, username, next){
	db.collection('posts').find(
		{
			"buyer" : username
		}, function (err, posts){
			assert.equal(err.null);
			next(posts);
		});
};
//Finds all posts that are currently available
var getAvailablePosts  = function(db, next){
	db.collection('posts').find(
		{
			"available" : true
		}, function (err, posts){
			assert.equal(err.null);
			next(posts);
		});
};

//UPDATE
//Updates the title, postContent, and tags
var updatePost = function(db, post){
	db.collection('posts').update(
		{
			"id" : post.id
		},{
			$set{
				"title" : newPost.title,
				"postContent" : newPost.postContent,
				"tags" : newPost.tags
			}

		}, function(err, result) {
			assert.equal(err, null);
		});
};
//For use when a user buys/rents this post's offer
var makeUnavailable = function(db, postID, secUsername){
	db.collection('posts').update(
		{
			$set{"id" : postID}
		}, {
			"available" : false,
			"buyer" : secUsername

		}, function(err, result){
			assert.equal(err, null);
		});
}

//DELETE
var deletePost = function(db, postID){
	db.collection('posts').remove(
	{
		"id": postID
	}, function(err, result){
		assert.equal(err, null);
	});
};

///**************REVIEW COLLECTION*********************************
//CREATION
var insertReview = function(db, newReview){
	db.collection('review').insertOne( 
	{
		//users
		"reviewer" : newReview.reviewer,
		"reviewee" : newReview.reviewee,

		"postID" : newReview.postID, //Reviewed experience

		"date" : newReview.date,
		"rating" : newReview.rating,
		"comment" : newReview.comment

	}, function(err, result) {
			    assert.equal(err, null);
			    console.log("Inserted a review into the review collection");
	});
};

//READ
//Finds the review by <reviewer> related to the post with id <POSTID>
var getReview = function(db, postID, reviewer, next){
	db.collection("review").findOne(
		{
			"postID" : postID,
			"reviewer" : reviewer
		}, function(err, review){
			assert.equal(err, null);
			next(review);
		});
};
//Finds all reviews based on the related post with id postID 
var getReviewsByID =  function(db, postID, next){
	db.collection("review").find(
		{
			"postID" : postID
		}, function(err, reviews){
			assert.equal(err, null);
			next(reviews);
		});
};
//Finds all reviews written by <username>
var getReviewsFrom =  function(db, username, next){
	db.collection("review").find(
		{
			"reviewer" : username
		}, function(err, reviews){
			assert.equal(err, null);
			next(reviews);
		});
};
//Finds all reviews where <username> is reviewed
var getReviewsAbout =  function(db, username, next){
	db.collection("review").find(
		{
			"reviewee" : username
		}, function(err, reviews){
			assert.equal(err, null);
			next(reviews);
		});
};


//UPDATE
//Updates the date, rating, and comment (other values cannot change)
var updateReview = function(db, review){
	db.collection('review').update(
		{
			"postID" : review.postID,
			"reviewer" : review.reviewer
		}, {
			$set: {
				"date" : review.date, 
				"rating" : review.rating, 
				"comment" : review.comment
			}
		}, function(err, result){});
};

//DELETE
var deleteReview = function(db, postID, reviewer){
	db.collection('review').remove(
	{
		"postID" : postID,
		"reviewer" : reviewer
	}, function(err, result){
		assert.equal(err, null);
	});
};