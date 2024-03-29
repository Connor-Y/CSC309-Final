var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;

var url = 'mongodb://localhost:27017/VGExchange';

//0 is superadmin, 1 is admin, 2 is normal user

MongoClient.connect(url, function(err, database) {
  assert.equal(null, err);
  console.log("Connected to DB");
  exports.db = database;

  //console.log("testing");
  /*
  var testUser = {email: "name@mail.com", username : "no1", password : "123", name: "Nam", description : "testing the database"};
  var testUser2 = {email: "name2@mail.com", username : "no1", password : "123", name: "ME", description : "ALso testing the database"};
  insertUser(db, testUser);
  getUserByUsername(db, testUser.username, function(result){
  	console.log("getUserByUsername: ");
  	console.dir(result);
  });
  validateUser(db, testUser.username, testUser.password, function(isValid){
  	console.log("ValidateUser, true: " + isValid);
  });
  validateUser(db, testUser.username, "567", function(isValid){
  	console.log("ValidateUser, false: " + isValid);
  });
  userExists(db, testUser, function(exists){
  	console.log("UserExists, true: " + exists);
  });
    userExists(db, testUser2, function(exists){
  	console.log("UserExists, true: " + exists);
  });
  updateUserInfo(db, testUser2);
  updateUserPassword(db, testUser.username, "666");
  validateUser(db, testUser.username, "666", function(isValid){
  	console.log("ValidateUser, true: " + isValid);
  });
  getUserByUsername(db, testUser.username, function(result){
  	console.log("getUserByUsername: ");
  	console.dir(result);
  });
  deleteUser(db, testUser.username);
  */
  /*
  	var testPost = {username : "testUser", id : 1, date : "2015-04-17", 
  		title : "RENT MY GAME", postContent : "Great Deal, only $10", image : "url.com/pic", 
  		price: 10, tags : ["rental", "Specific Game"],
	};
	var testPost2 = {username : "testUser", id : 1, date : "2015-04-17", 
  		title : "PLEASE RENT MY GAME", postContent : "Great Deal, only $8", image : "url.com/pic2", 
  		price: 8, tags : ["rental", "Specific Game"],
	};
	deletePost(db, 1);
	insertPost(db, testPost);
	getPostsByTag(db, "rental", function(posts){
		console.log("Post by tag:");
		console.dir(posts);
	});
	makeUnavailable(db, 1, "user222");
	updatePost(db, testPost2);
	getPostByID(db, 1, function(post){
		console.log("Post by ID:");
		console.dir(post);
	});
	deletePost(db, 1);
	getAvailablePosts(db, function(posts){
		console.log("available (after deletion): ");
		console.dir(posts);
	});
	var testReview = {reviewee: "user1", reviewer: "user222", postID: 1, date: "2015-11-25", rating: 4, comment: "Awesome deal!"};
	var updatedReview = {reviewee: "user1", reviewer: "user222", postID: 1, date: "2015-11-28", rating: 5, comment: "Super Awesome deal!"};
	insertReview(db, testReview);
	getReviewsFrom(db, "user222", function(reviews){  
		console.log("Reviews from user1");
		console.dir(reviews);
	});
	getReviewsAbout(db, "user1", function(reviews){
		console.log("Reviews about user222");
		console.dir(reviews);
	});
	getReviewsByID(db, 1, function(reviews){
		console.log("Reviews about post#1");
		console.dir(reviews);
	});
	updateReview(db, updatedReview);
	getReview(db, 1, "user222", function(reviews){
		console.log("Reviews about post#1 by user222");
		console.dir(reviews);
	});
	deleteReview(db, 1, "user222");
		*/

});

///***************USER COLLECTION***************************
//Create a new user
exports.insertUser = function(db, newUser, facebook) {
    
    db.collection('users').find().toArray(function (err, users){
        assert.equal(err, null);	
        var admin = 2;
        
        if (users.length == 0) {    
            admin = 0;
        }
        
        db.collection('users').insertOne(
        {
            "email" : newUser.email,
            "username": newUser.username,
            "password": newUser.password,
            "name": "",
            "description" : "NEW USER",
            "admintype" : admin,
            "rating" : 0,
            "numReviews" : 0,
            "pic" : "http://s3.amazonaws.com/suh-s3-nfs/userProfileImages/670.png",
            "facebook" : facebook
        }, function(err, result) {
            assert.equal(err, null);
            console.log("inserted a document into the users collection.");
            console.log("" + admin);
        });
    });
};

// Get all users in the database
exports.getAllUsers = function (db, next) {
	db.collection('users').find(
		{}).toArray(function (err, users) {
			assert.equal(err, null);
			next(users);
		});
};

// Delete all users in the database
exports.removeallusers = function(db, next) {
	db.collection('users').remove({});
};

// Get a user's information, querying for matching username
exports.getUserByUsername = function(db, username, next){
	db.collection('users').findOne(
		{
			"username" : username
		}, function(err, user){
			assert.equal(err, null);
			next(user);
		});
};

// Get a user's information, querying for matching email
exports.getUserByEmail = function(db, email, next){
	db.collection('users').findOne(
		{
			"email" : email
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
};

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
};

// Update the user's username
exports.updateUserName = function(db, username, newname){
	db.collection('users').update(
		{
			"username" : username
		},{
			$set: {
				"username" : newname			
				}
		}, function(err, result) {
			assert.equal(err, null);
		});
};

// Update the user's profile picture
exports.updateUserPic = function(db, username, newpic){
	db.collection('users').update(
		{
			"username" : username
		},{
			$set: {
				"pic" : newpic		
				}
		}, function(err, result) {
			assert.equal(err, null);
		});
};

// Update the user's description
exports.updateUserDescription = function(db, username, description){
	console.log("got the username " + username);
	db.collection('users').update(
		{
			"username" : username
		},{
			$set: {
				"description" : description
			}
		}, function(err, result) {
			assert.equal(err, null);
		});
};

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
};

// Update the user's rating based on the current rating 
// and the new rating
exports.updateUserRating = function(db, username, newRating){
	db.collection('users').findOne(
		{
			"username" : username
		},function(err, user) {
			assert.equal(err, null);
			console.log("user rating + num reviews is: " + user.rating * user.numReviews);
			var updatedRating = ((Number(user.rating) * Number(user.numReviews) + Number(newRating)) / (Number(user.numReviews) + 1));
	
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
// Delete the specified user
exports.deleteUser = function(db, username){
	db.collection('users').remove(
	{
		"username": username
	}, function(err, result){
		assert.equal(err, null);
	});
};

// Toggle a user's admin status
exports.toggleAdmin = function (db, username) {
    
    db.collection('users').findOne(
    {
        "username" : username
    }, function (err, user) {
        assert.equal(err, null);
        
        var updatedadmin = 2;
        
        if (user.admintype == 2) {
            updatedadmin = 1;
        }
        
        db.collection('users').update(
        {
		  "username" : username
		},{
		  $set: {"admintype" : updatedadmin}
		}, function(err, result){
		  assert.equal(err, null);
		});
    });
};

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
};
//READ
//Finds a post by it's unique id
exports.getPostByID = function(db, postID, next){
		console.log("the by id is " + postID);

	db.collection('posts').findOne(//find one?
	
		{
			"_id" : ObjectId(postID)
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

exports.getAllTags = function (db, next) {
	db.collection('posts').find(
		{
			"available" : true,
		}).toArray(function (err, posts) {
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

//UPDATE change later

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
			"_id" : ObjectId(postID)

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

exports.getAllReviews = function (db, next) {
	db.collection('review').find(
		{}).toArray(function (err, users) {
			assert.equal(err, null);
			next(users);
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

exports.removeallreviews = function(db, next) {
	db.collection('reviews').remove({});
};

exports.getAllReviews = function (db, next) {
	db.collection('reviews').find(
		{}).toArray(function (err, users) {
			assert.equal(err, null);
			next(users);
		});
};

