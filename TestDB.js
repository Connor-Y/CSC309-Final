var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;

var url = 'mongodb://localhost:27017/VGExchangeTestDB';

exports.connect = function(next) {
	MongoClient.connect(url, function(err, database) {
	  assert.equal(null, err);
	  console.log("Connected to DB");
	  exports.db = database;
	  next();
	});
};

///***************USER COLLECTION***************************
//Create
exports.insertUser = function(db, newUser) {
	db.collection('users').insertOne( 
	{
		"email" : newUser.email,
		"username" : newUser.username,
		"password" : newUser.password,
		"name" : "",
		"description" : "NEW USER",

		"rating" : 0,
		"numReviews" : 0

	}, function(err, result) {
			assert.equal(err, null);
			console.log("Inserted a document into the users collection.");
	});

};

exports.getUserByUsername = function(db, username, next){
	db.collection('users').findOne(
		{
			"username" : username
		}, function(err, user){
			assert.equal(err, null);
			next(user);
		});
};

//For logging in, checks that passwords match, sends boolean to next()
exports.validateUser = function(db, username, password, next){
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
exports.userExists = function(db, username, email, next){
	db.collection('users').findOne(
		{
			$or: [{"email": email}, {"username": username}]
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
exports.updateUserInfo = function(db, user){
	db.collection('users').update(
		{
			"username" : user.username
		},{
			$set: {
				"name" : user.name,
				"description" : user.description
			}
		}, function(err, result) {
			assert.equal(err, null);
		});
}


exports.updateUserName = function(db, user){
	db.collection('users').update(
		{
			"username" : user.username
		},{
			$set: {
				"description" : user.description
			}
		}, function(err, result) {
			assert.equal(err, null);
		});
}

exports.updateUserDescription = function(db, user){
	db.collection('users').update(
		{
			"username" : user.username
		},{
			$set: {
				"description" : user.description
			}
		}, function(err, result) {
			assert.equal(err, null);
		});
}
//update the user <username>'s password
exports.updateUserPassword = function(db, username, password){
	db.collection('users').update(
		{
			"username" : username
		},{
			$set: {"password" : password}
		}, function(err, result) {
			assert.equal(err, null);
		});
}
exports.updateUserRating = function(db, username, newRating){
	db.collection('users').findOne(
		{
			"username" : username
		},function(err, user) {
			assert.equal(err, null);
			var updatedRating = ((user.rating*user.numReviews) + newRating)/(user.numReviews+1)
			db.collection('users').update(
			{
				"username" : username
			},{
				$set: {"rating" : updatedRating,
						"numReviews" : user.numReviews+1}
			}, function(err, result){
				assert.equal(err, null);
			});
		});
}
//DELETE
exports.deleteUser = function(db, username){
	db.collection('users').remove(
	{
		"username": username
	}, function(err, result){
		assert.equal(err, null);
	});
}

///***********************POSTS COLLECTION*******************************************
//CREATE
exports.insertPost = function(db, newPost){
	db.collection('posts').insertOne( 
	{
		//Idenifiers
		"username" : newPost.username,
		"id" : newPost.id, //Different than _id

		"date" : newPost.date,
		"title" : newPost.title,
		"price" : newPost.price,
		"postContent" : newPost.postContent,
		"image" : newPost.image,
		"tags" : newPost.tags,

		"available" : true,  //Set to false when game is rented/bought
		"buyer" : "" //User who buys/rents game

	}, function(err, result) {
			    assert.equal(err, null);
			    console.log("Inserted a post into the posts collection");
	});
};

exports.removeall = function(db, next) {
	db.collection('posts').remove({});
	next();
};

//READ
//Finds a post by it's unique id
exports.getPostByID = function(db, postID, next){
	db.collection('posts').findOne(
		{
			"id" : postID
		}, function (err, post){
			assert.equal(err, null);
			next(post);
		});
};
//Finds all posts made by user <username>
exports.getPostsFrom = function(db, username, next){
	db.collection('posts').find(
		{
			"username" : username
		}).toArray(function (err, posts){
			assert.equal(err, null);
			next(posts);
		});
};
//Finds all posts where the buyer is user <username>
exports.getPostsBoughtBy = function(db, username, next){
	db.collection('posts').find(
		{
			"buyer" : username
		}).toArray(function (err, posts){
			assert.equal(err, null);
			next(posts);
		});
};
//Finds all posts that are currently available
exports.getAvailablePosts = function(db, next){
	db.collection('posts').find(
		{
			"available" : true
		}).toArray(function (err, posts){
			assert.equal(err, null);
			next(posts);
		});
};

exports.getPostsByTag = function(db, tag, next){
	db.collection('posts').find(
		{
			"available" : true,
			"tags" : tag
		}).toArray(function (err, posts){
			assert.equal(err, null);
			next(posts);
		});
};

//UPDATE
//Updates the title, postContent, and tags
exports.updatePost = function(db, post){
	db.collection('posts').update(
		{
			"id" : post.id
		},{
			$set: {
				"title" : post.title,
				"postContent" : post.postContent,
				"image" : post.image,
				"price" : post.price,
				"tags" : post.tags
			}
		}, function(err, result) {
			assert.equal(err, null);
		});
};
//For use when a user buys/rents this post's offer
exports.makeUnavailable = function(db, postID, secUsername){
	db.collection('posts').update(
		{
			"id" : postID
		}, {
			$set: {
				"available" : false,
				"buyer" : secUsername
			}

		}, function(err, result){
			assert.equal(err, null);
		});
};

//DELETE
exports.deletePost = function(db, postID){
	db.collection('posts').remove(
	{
		"id": postID
	}, function(err, result){
		assert.equal(err, null);
	});
};

///**************REVIEW COLLECTION*********************************
//CREATION
exports.insertReview = function(db, newReview){
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
exports.getReview = function(db, postID, reviewer, next){
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
exports.getReviewsByID =  function(db, postID, next){
	db.collection("review").find(
		{
			"postID" : postID
		}).toArray(function (err, reviews){
			assert.equal(err, null);
			next(reviews);
		});
};
//Finds all reviews written by <username>
exports.getReviewsFrom =  function(db, username, next){
	db.collection("review").find(
		{
			"reviewer" : username
		}).toArray(function (err, reviews){
			assert.equal(err, null);
			next(reviews);
		});
};
//Finds all reviews where <username> is reviewed
exports.getReviewsAbout =  function(db, username, next){
	db.collection("review").find(
		{
			"reviewee" : username
		}).toArray(function (err, reviews){
			assert.equal(err, null);
			next(reviews);
		});
};


//UPDATE
//Updates the date, rating, and comment (other values cannot change)
exports.updateReview = function(db, review){
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
exports.deleteReview = function(db, postID, reviewer){
	db.collection('review').remove(
	{
		"postID" : postID,
		"reviewer" : reviewer
	}, function(err, result){
		assert.equal(err, null);
	});
};

