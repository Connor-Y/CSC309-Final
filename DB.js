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

///USER COLLECTION
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
var getUserByUsername = function(db, username, next){
	db.collection('users').findOne(
		{
			"username" : username
		},
		{
			"password" : 0     //does not include password field in result

		}, function(err, userFound){
			assert.equal(err, null);
			next(userFound);
		});
};
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
var updateUserInfo = function(db, user){
	db.collection('users').update(
		{
			"username" : user.username
		},{
			"name" : user.name,
			"description" : user.description,
		}, function(err, result) {
			assert.equal(err, null);
		});
}
var updateUserPassword = function(db, username, password){
	db.collection('users').update(
		{
			"username" : username
		},{
			"password" : password
		}, function(err, result) {
			assert.equal(err, null);
		});
}
var deleteUser = function(db, username){
	db.collection('users').remove(
	{
		"username": username
	}, function(err, result){
		assert.equal(err, null);
	});
}

///POST COLLECTION
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

		"availible" : true  //Set to false when game is rented/bought

	}, function(err, result) {
			    assert.equal(err, null);
			    console.log("Inserted a post into the posts collection");
	});
};

///REVIEW COLLECTION
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