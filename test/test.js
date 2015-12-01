var expect = require('chai').expect;
var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var databaseFile = require('../DB');

// Helper Functions
function createNoHashUser(mail, name, pass) {
	var newUser = {email: mail, username: name, password: pass};
	return newUser;
	
}

function createPosting(username, id, date, title, content, tags, buyer) {
	var newPost = {username: username, id: id, date: date, title: title,
					postContent: content, tags: tags, buyer: buyer};
	return newPost
}

function createReview(reviewer, reviewee, id, date, rating, comment) {
	var newReview = {reviewer: reviewer, reviewee: reviewee, postID: id, 
	date: date, rating: rating, comment: comment};
	
	return newReview;
	
}

//console.log("Before Sleep");
//sleep(4000);

function sleep(time) {
    var stop = new Date().getTime();
    while(new Date().getTime() < stop + time) {
        ;
    }
}


var url = 'mongodb://localhost:27017/VGExchange';

var db;

describe("Database", function() {
	this.timeout(10000);
	describe("Database check", function () {
		// Check that the database exists
		it("db connection", function (done) {
			databaseFile.connect(function () {
				db = databaseFile.db;
				expect(db).to.not.be.null;
				expect(db).to.not.be.undefined;
				done();
			});
		});
	});
	
	describe("User Functions", function () {	
		var email1 = "a@test.com";
		var name1 = "Alice";
		var pass1 = "aPass";
		
		var email2 = "b@test.com";
		var name2 = "Bob";
		var pass2 = "bpass";
		
		var email3 = "e@test.com";
		var name3 = "Eve";
		var pass3 = "epass";
		
		var user1 = createNoHashUser(email1, name1, pass1);
		var user2 = createNoHashUser(email2, name2, pass2);
		var user3 = createNoHashUser(email3, name3, pass3);
		
		before("Create Users", function (done) {
				databaseFile.insertUser(db, user1);
				databaseFile.insertUser(db, user2);
				databaseFile.insertUser(db, user3);
				sleep(400);
				done();
		});
		
		describe("Verify Users", function () {
			var userA;
			var userB;
			var userC;
			before("getUsers", function (done) {
				databaseFile.getUserByUsername(db, name1, function(usera) {
					userA = usera;
					databaseFile.getUserByUsername(db, name2, function(userb) {
						userB = userb;
						databaseFile.getUserByUsername(db, name3, function(userc) {
							userC = userc;
							done();
						});
					});
				});
			});

			it('user1 check', function(done) {
				expect(userA.username).to.equal(name1);
				expect(userA.email).to.equal(email1);
				done();
			});
			
			it('user2 check', function(done) {
				expect(userB.username).to.equal(name2);
				expect(userB.email).to.equal(email2);
				done();
			});
			
			it('user3 check', function(done) {
				expect(userC.username).to.equal(name3);
				expect(userC.email).to.equal(email3);
				done();
			});
		});	
		
	
		describe("Update User", function () {	
			var newUser;
			var gen;
			before("Create Temp User", function (done) {
				gen = Math.floor((Math.random() * 10000)).toString();
				newUser = createNoHashUser(gen, gen, "pass");
				databaseFile.insertUser(db, newUser);
				sleep(400);
				done();
			});
			
			it('Update name', function (done) {
				databaseFile.getUserByUsername(db, gen, function (user) {
					var newName = Math.floor((Math.random() * 10000)).toString(); 
					user.name = newName;
					databaseFile.updateUserInfo(db, user);
					sleep(400);
					databaseFile.getUserByUsername(db, user.username, function (updatedUser) {
						expect(updatedUser.name).to.equal(newName);
						done();
					});
				});
				
			});
			
			
			it('Update Description', function (done) {
				var newDesc = Math.floor((Math.random() * 10000)).toString();
				databaseFile.getUserByUsername(db, gen, function (user) {
					user.description = newDesc;
					databaseFile.updateUserInfo(db, user);
					sleep(400);
					databaseFile.getUserByUsername(db, user.username, function (updatedUser) {
						expect(updatedUser.description).to.equal(newDesc);
						done();
					});
				});
			});
			
			after("Delete Temp User", function (done) {
				databaseFile.deleteUser(db, gen);
				sleep(400);
				done();
			});
			
			// Security?
			/* TODO: Implement
			it('Update pass', function () {
				var newPass = Math.floor((Math.random() * 10000)).toString();
				updateUser(email, newPass, ...);
				expect((getUser(email).pass).to.equal(newPass));
			}); 
			*/
		});
		
		describe("Delete User", function () {
			var gen;
			before('tempUser', function (done) {
				gen = Math.floor((Math.random() * 10000)).toString();
				var newUser = createNoHashUser(gen, gen, "pass");
				databaseFile.insertUser(db, newUser)
				sleep(400);
				done();
			});
			// What does getUserByUsername return if not existent?
			it('Delete user', function (done) {
				databaseFile.deleteUser(db, gen);
				sleep(400);
				databaseFile.getUserByUsername(db, gen, function (user) {
					expect(user).to.be.null;
					done();
				});
			});
		});
	});
});		
// === In Progress Below ===

		
	/* 
	describe('Posting Functions', function () {
		before('Create Posting', function() {
			var u1 = createNoHashUser("A", "A", "A");
			var u2 = createNoHashUser("B", "B", "B");
			var u3 = createNoHashUser("C", "C", "C");
			insertUser(db, u1);
			insertUser(db, u2);
			insertUser(db, u3);
			var gen = [];
			for (i = 0; i < 4*7; i++) {
				if (i == 0)
					gen.push(u1.username);
				else if (i == 7)
					gen.push(u2.username);
				else if (i == 14)
					gen.push(u3.username);
				else if (i == 21)
					gen.push(u1.username);
				else
					gen.push(Math.floor((Math.random() * 10000)).toString());
			}
			
			// Name, id, date, title, postContent, tags, available (unused), buyer (unused)
			var p1 = createPosting(gen[0], gen[1], gen[2], gen[3], gen[4], gen[5], gen[6]);
			var p2 = createPosting(gen[7], gen[8], gen[9], gen[10], gen[11], gen[12], gen[13]);
			var p3 = createPosting(gen[14], gen[15], gen[16], gen[17], gen[18], gen[19], gen[20]);
			var p4 = createPosting(gen[20], gen[21], gen[22], gen[23], gen[24], gen[25], gen[26]);
			insertPost(db, p1);
			insertPost(db, p2);
			insertPost(db, p3);
			insertPost(db, p4);
		});
		
		after('Delete Temp', function () {
			deleteUser(db, u1.username);
			deleteUser(db, u2.username);
			deleteUser(db, u3.username);
			deletePost(db, p1.id);
			deletePost(db, p1.id);
			deletePost(db, p2.id);
			deletePost(db, p3.id);
			deletePost(db, p4.id);
			
		});
		
		beforeEach('Create Temporary Posting', function () {
			var tempGen = [];
			for (i = 0; i < 7; i++) {
				if (i == 0)
					tempGen.push(u3.username);
				else
					tempGen.push(Math.floor((Math.random() * 10000)).toString());
			}
			var tempPost = createPosting(tempGen[0], tempGen[1], tempGen[2], tempGen[3], tempGen[4], tempGen[5], tempGen[6]);
			insertPost(db, tempPost);
		});
		
		afterEach('Delete Temporary Posting', function () {
			deletePost(db, tempGen[1]);	
		});

		describe('Verify Postings', function () {
			it('Get Postings', function () {
				var testP1 = getPostByID(db, gen[1]);
				var testP2 = getPostByID(db, gen[8]);
				var testP3 = getPostsFrom(db, gen[14]);
				var testP4 = getPostsFrom(db, gen[20]);
				
				expect(testP1.username).to.equal(gen[0]);
				expect(testP2.date).to.equal(gen[9]);
				expect(testP3.postContent).to.equal(gen[18]);
				expect(testP4.tags).to.equal(gen[25]);	
			});
		});
		
		
		describe('Update Posting', function () {	
			it('Update All Info', function () {
				var newTitle = Math.floor((Math.random() * 10000)).toString();
				var newContent = Math.floor((Math.random() * 10000)).toString();
				var newTags = Math.floor((Math.random() * 10000)).toString();
				var updatedPost = getPostByID(tempGen[1]);
				updatedPost.title = newTitle;
				updatedPost.postContent = newContent;
				updatedPost.tags = newTags;
				updatePost(db, updatedUser);
				expect(getPostByID(tempGen[1]).title.to.equal(newTitle));
				expect(getPostByID(tempGen[1]).postContent.to.deep.equal(newContent));
				expect(getPostByID(tempGen[1]).tags.to.deep.equal(newTags));
			});
			
			it('Make Unavailable', function () {
				var tempBuyer = Math.floor((Math.random() * 10000)).toString();
				makeUnavailable(db, tempGen[1], tempBuyer);
				
				expect(getPostByID(tempGen[1]).available.to.false);
				expect(getPostByID(tempGen[1]).buyer.to.equal(tempBuyer));
			});
		});
		
		describe('Delete Function', function() {						
			it('Delete Posting', function () {
				deletePost(db, tempGen[1]);
				expect(getPostByID(db, tempGen[1]).to.be.null);
				
			});
		});
			
	}); 
		
	
		
		
		
	// Review Testing
	describe('Review Testing', function () {
		before('Init Temp Users/Postings', function() {
			var u1 = createNoHashUser("A", "A", "A");
			var u2 = createNoHashUser("B", "B", "B");
			var u3 = createNoHashUser("C", "C", "C");
			insertUser(db, u1);
			insertUser(db, u2);
			insertUser(db, u3);
			var gen = [];
			for (i = 0; i < 4*7; i++) {
				if (i == 0)
					gen.push(u1.username);
				else if (i == 7)
					gen.push(u2.username);
				else if (i == 14)
					gen.push(u3.username);
				else if (i == 21)
					gen.push(u1.username);
				else
					gen.push(Math.floor((Math.random() * 10000)).toString());
			}
			
			// Name, id, date, title, postContent, tags, available (unused), buyer (unused)
			var p1 = createPosting(gen[0], gen[1], gen[2], gen[3], gen[4], gen[5], gen[6]);
			var p2 = createPosting(gen[7], gen[8], gen[9], gen[10], gen[11], gen[12], gen[13]);
			var p3 = createPosting(gen[14], gen[15], gen[16], gen[17], gen[18], gen[19], gen[20]);
			var p4 = createPosting(gen[20], gen[21], gen[22], gen[23], gen[24], gen[25], gen[26]);
			insertPost(db, p1);
			insertPost(db, p2);
			insertPost(db, p3);
			insertPost(db, p4);
		});
		
		after('Delete Temp Users/Posts', function () {
			deleteUser(db, u1.username);
			deleteUser(db, u2.username);
			deleteUser(db, u3.username);
			deletePost(db, p1.id);
			deletePost(db, p1.id);
			deletePost(db, p2.id);
			deletePost(db, p3.id);
			deletePost(db, p4.id);
			
		});
		
		beforeEach('Create Temporary Review', function () {
			var tempGen = [];
			for (i = 0; i < 6; i++) {
				if (i == 0)
					tempGen.push(u2.username);
				else if (i == 1)
					tempGen.push(u1.id);
				else if (i == 2)
					tempGen.push(p1.id);
				else
					tempGen.push(Math.floor((Math.random() * 10000)).toString());
			}
			var tempReview = createReview(tempGen[0], tempGen[1], tempGen[2], tempGen[3], tempGen[4], tempGen[5], tempGen[6]);
			insertReview(db, tempReview);
		});
		
		afterEach('Delete Temporary Posting', function () {
			deleteReview(db, tempGen[2], tempGen[0]);	
		});
		
		describe('Verify Posting', function () {
			it('getReview', function () {
				getReview(db, tempGen[2], tempGen[0], function (review) {
					expect(review.to.deep.equal(tempReview));
				});
			});
			
			it('getReviewByID', function () {
				getReviewsByID(db, tempGen[2], function (review) {
					expect(review[0].to.deep.equal(tempReview));
				});
			});
			
			
			it('getReviewsFrom', function () {
				getReviewsFrom(db, u2.username, tempGen[0], function (review) {
					expect(review.to.deep.equal(tempReview));
				});
			});
		}); */
		/*
		decribe('Verify Games', function () {
			it('Game 1, Comment 3', function () {
			
				
			});
			it('Game 2, Comment 1', function () {
		
				
			});
			it('Game 2, Comment 2', function () {
		
				
			});
		});
		
		decribe('Verify User', function () {
			it('User 1, Comment 1', function () {
				
				
			});
			it('User 1, Comment 2', function () {
			
				
			});
			it('User 2, Comment 2', function () {
				
				
			});
		});
		
		describe('Edit Comment', function () {
			it('Edit Comment 1', function () {
				// Edit and verify
			})
		});	
		
		describe('Delete Comment', function () {
			before('Create deletable comment', function () {
			
				
			});
			
			it('Delete comment 1', function () {
				// Delete comment and verify null
				
			});
			
		});
	});
	
	describe('Ratings', function() {
		before('Init Ratings', function() {
			// Create ratings on various Postings
			
			// Create ratings on users
			
			// Create rating on games
		});
		
		// See above for tests
	});
	*/
//	});
	
//});

	