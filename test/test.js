var expect = require('chai').expect;
var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var databaseFile = require('../TestDB');
var serverFile = require('../server');

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
		var email1 = Math.floor((Math.random() * 100000)).toString(); 
		var name1 = Math.floor((Math.random() * 100000)).toString(); 
		var pass1 = Math.floor((Math.random() * 100000)).toString(); 
		
		var email2 = Math.floor((Math.random() * 100000)).toString(); 
		var name2 = Math.floor((Math.random() * 100000)).toString(); 
		var pass2 = Math.floor((Math.random() * 100000)).toString(); 
		
		var email3 = Math.floor((Math.random() * 100000)).toString(); 
		var name3 = Math.floor((Math.random() * 100000)).toString(); 
		var pass3 = Math.floor((Math.random() * 100000)).toString(); 
		
		var user1 = createNoHashUser(email1, name1, pass1);
		var user2 = createNoHashUser(email2, name2, pass2);
		var user3 = createNoHashUser(email3, name3, pass3);
		
		before("Create Users", function (done) {
				databaseFile.insertUser(db, user1);
				databaseFile.insertUser(db, user2);
				databaseFile.insertUser(db, user3);
				sleep(200);
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
		
		describe('Existance Check', function () {
			it('User Exists', function (done) {
				databaseFile.userExists(db, name2, email2, function (result) {
					expect(result).to.be.true;
					done();
				});
			});
			
			it('User does not exist', function (done) {
				databaseFile.userExists(db, name2 + "fail", email2 + "fail", function (result) {
					expect(result).to.be.false;
					done();
				});
			});
			
		});
		
	
		describe("Update User", function () {	
			var newUser;
			var gen;
			before("Create Temp User", function (done) {
				gen = Math.floor((Math.random() * 100000)).toString();
				newUser = createNoHashUser(gen, gen, "pass");
				databaseFile.insertUser(db, newUser);
				sleep(200);
				done();
			});
			
			it('Update name', function (done) {
				databaseFile.getUserByUsername(db, gen, function (user) {
					var newName = Math.floor((Math.random() * 100000)).toString(); 
					user.name = newName;
					databaseFile.updateUserInfo(db, user);
					sleep(200);
					databaseFile.getUserByUsername(db, user.username, function (updatedUser) {
						expect(updatedUser.name).to.equal(newName);
						done();
					});
				});
			});
				
			it('Update Password', function (done) {
				var newPass = Math.floor((Math.random() * 100000)).toString(); 
				databaseFile.updateUserPassword(db, gen, newPass);
				sleep(200);
				databaseFile.validateUser(db, gen, newPass, function(isValid){
					expect(isValid).to.be.true;
					done();
				});
			});
			
			
			it('Update Description', function (done) {
				var newDesc = Math.floor((Math.random() * 100000)).toString();
				databaseFile.getUserByUsername(db, gen, function (user) {
					user.description = newDesc;
					databaseFile.updateUserInfo(db, user);
					sleep(200);
					databaseFile.getUserByUsername(db, user.username, function (updatedUser) {
						expect(updatedUser.description).to.equal(newDesc);
						done();
					});
				});
			});
			
			after("Delete Temp User", function (done) {
				databaseFile.deleteUser(db, gen);
				sleep(200);
				done();
			});
		});
		
		describe("Password Validation", function () {
			it('Password Check True', function (done) {
			  databaseFile.validateUser(db, name1, pass1, function(isValid){
				expect(isValid).to.be.true;
				done();
			  });
			});
			
			it('Password Check False', function (done) {
			  databaseFile.validateUser(db, name1, pass1 + "fail", function(isValid){
				expect(isValid).to.be.false;
				done();
			  });
			});
		});
		
		describe("Delete User", function () {
			var gen;
			before('tempUser', function (done) {
				gen = Math.floor((Math.random() * 100000)).toString();
				var newUser = createNoHashUser(gen, gen, "pass");
				databaseFile.insertUser(db, newUser)
				sleep(200);
				done();
			});
			
			it('Delete user', function (done) {
				databaseFile.deleteUser(db, gen);
				sleep(200);
				databaseFile.getUserByUsername(db, gen, function (user) {
					expect(user).to.be.null;
					done();
				});
			});
		});
	});
	
	describe('Posting Functions', function () {
		var gen = [], tempGen = [];
		var u1, u2, u3;
		var p1, p2, p3, p4;
		before('Create Posting', function(done) {
			databaseFile.removeall(db, function () {
				u1 = createNoHashUser("A", "A", "A");
				u2 = createNoHashUser("B", "B", "B");
				u3 = createNoHashUser("C", "C", "C");
				databaseFile.insertUser(db, u1);
				databaseFile.insertUser(db, u2);
				databaseFile.insertUser(db, u3);
				sleep(200);
				for (i = 0; i < 4*7; i++) {
					if (i == 0)
						gen.push(u1.username);
					else if (i == 7)
						gen.push(u2.username);
					else if (i == 14)
						gen.push(u3.username);
					else if (i == 20)
						gen.push(u1.username);
					else
						gen.push(Math.floor((Math.random() * 100000)).toString());
				}
				
				// Name, id, date, title, postContent, tags, available (unused), buyer (unused)
				p1 = createPosting(gen[0], gen[1], gen[2], gen[3], gen[4], gen[5], gen[6]);
				p2 = createPosting(gen[7], gen[8], gen[9], gen[10], gen[11], gen[12], gen[13]);
				p3 = createPosting(gen[14], gen[15], gen[16], gen[17], gen[18], gen[19], gen[20]);
				p4 = createPosting(gen[20], gen[21], gen[22], gen[23], gen[24], gen[25], gen[26]);
				databaseFile.insertPost(db, p1);
				databaseFile.insertPost(db, p2);
				databaseFile.insertPost(db, p3);
				databaseFile.insertPost(db, p4);
				sleep(200);
				done();
			});
		});
		
		after('Delete Temp', function (done) {
			databaseFile.deleteUser(db, u1.username);
			databaseFile.deleteUser(db, u2.username);
			databaseFile.deleteUser(db, u3.username);
			// databaseFile.deletePost(db, gen[1]);
			// databaseFile.deletePost(db, gen[8]);
			// databaseFile.deletePost(db, gen[15]);
			// databaseFile.deletePost(db, gen[21]);
			sleep(100);
			databaseFile.removeall(db, function () {done();});
			
		});
		
		beforeEach('Create Temporary Posting', function (done) {
			tempGen = [];
			for (i = 0; i < 7; i++) {
				if (i == 0)
					tempGen.push(u3.username);
				else
					tempGen.push(Math.floor((Math.random() * 100000)).toString());
			}
			var tempPost = createPosting(tempGen[0], tempGen[1], tempGen[2], tempGen[3], tempGen[4], tempGen[5], tempGen[6]);
			databaseFile.insertPost(db, tempPost);
			sleep(100);
			done();
		});
		
		afterEach('Delete Temporary Posting', function (done) {
			databaseFile.deletePost(db, tempGen[1]);
			sleep(100);
			done();
		});

		describe('Verify Postings', function () {
			it('Get Postings', function (done) {
				databaseFile.getPostByID(db, gen[1], function (post) {
					expect(post.username).to.equal(gen[0]);
					databaseFile.getPostByID(db, gen[8], function (post) {
						expect(post.date).to.equal(gen[9]);
						databaseFile.getPostByID(db, gen[15], function (post) {
							expect(post.postContent).to.equal(gen[18]);
							databaseFile.getPostByID(db, gen[21], function (post) {
								expect(post.tags).to.deep.equal(gen[25]);
								done();
							});
						});
					});
				});
			});
		});
		
				
		describe('Update Posting', function () {	
			var newTitle, newContent, newTags;
			it('Update All Info', function (done) {
				newTitle = Math.floor((Math.random() * 100000)).toString();
				newContent = Math.floor((Math.random() * 100000)).toString();
				newTags = Math.floor((Math.random() * 100000)).toString();
				databaseFile.getPostByID(db, tempGen[1], function (post) {
					post.title = newTitle;
					post.postContent = newContent;
					post.tags = newTags;
					databaseFile.updatePost(db, post);
					sleep(200);
					databaseFile.getPostByID(db, post.id, function (post) {
						expect(post.title).to.equal(newTitle);
						expect(post.postContent).to.deep.equal(newContent);
						expect(post.tags).to.deep.equal(newTags);
						done()
					});
				});
			});
			
			it('Make Unavailable', function (done) {
				var tempBuyer = Math.floor((Math.random() * 100000)).toString();
				databaseFile.makeUnavailable(db, tempGen[1], tempBuyer);
				sleep(100);
				databaseFile.getPostByID(db, tempGen[1], function (post) {
					expect(post.available).to.be.false;
					expect(post.buyer).to.equal(tempBuyer);
					done();
				});
			}); 
		});
		
		describe('Delete Function', function() {						
			it('Delete Posting', function (done) {
				databaseFile.deletePost(db, tempGen[1]);
				sleep(100);
				databaseFile.getPostByID(db, tempGen[1], function (post) {
					expect(post).to.be.null;
					done();
				});
			});
		})
		
		describe("'get' functions", function () {
			it('getPostsByTag', function (done) {
				databaseFile.getPostsByTag(db, gen[5], function(posts){
					expect(posts.length).to.equal(1);
					expect(posts[0].title).to.equal(p1.title);
					expect(posts[0].postContent).to.equal(p1.postContent);
					expect(posts[0].id).to.equal(p1.id);
					done();
				});	
			});	
			
			it('getPostsFrom', function (done) {
				databaseFile.getPostsFrom(db, u1.username, function (posts) {
					expect(posts.length).to.equal(2);
					expect(posts[0].title).to.equal(p1.title);			
					expect(posts[0].id).to.equal(p1.id);
					expect(posts[1].title).to.equal(p4.title);
					expect(posts[1].id).to.equal(p4.id);
					done();
				});
			});
		});
	
	
	
	});
	
	// Review Testing
	describe('Review Testing', function () {
		// Used to generate random reviews
		var gen = [], tempGen = [];
		var tempReview;
		// Test Users
		var u1, u2, u3;
		// Test Posts
		var p1, p2, p3, p4;
		before('Init Temp Users/Postings', function(done) {
			u1 = createNoHashUser("A", "A", "A");
			u2 = createNoHashUser("B", "B", "B");
			u3 = createNoHashUser("C", "C", "C");
			databaseFile.insertUser(db, u1);
			databaseFile.insertUser(db, u2);
			databaseFile.insertUser(db, u3);
			gen = [];
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
					gen.push(Math.floor((Math.random() * 100000)).toString());
			}
			
			// Name, id, date, title, postContent, tags, available (unused), buyer (unused)
			p1 = createPosting(gen[0], gen[1], gen[2], gen[3], gen[4], gen[5], gen[6]);
			p2 = createPosting(gen[7], gen[8], gen[9], gen[10], gen[11], gen[12], gen[13]);
			p3 = createPosting(gen[14], gen[15], gen[16], gen[17], gen[18], gen[19], gen[20]);
			p4 = createPosting(gen[20], gen[21], gen[22], gen[23], gen[24], gen[25], gen[26]);
			databaseFile.insertPost(db, p1);
			databaseFile.insertPost(db, p2);
			databaseFile.insertPost(db, p3);
			databaseFile.insertPost(db, p4);
			sleep(300);
			done();
		});
		
		after('Delete Users/Posts', function (done) {
			databaseFile.deleteUser(db, u1.username);
			databaseFile.deleteUser(db, u2.username);
			databaseFile.deleteUser(db, u3.username);
			databaseFile.deletePost(db, p1.id);
			databaseFile.deletePost(db, p1.id);
			databaseFile.deletePost(db, p2.id);
			databaseFile.deletePost(db, p3.id);
			databaseFile.deletePost(db, p4.id);
			sleep(400);
			done();
			
		});
		
		beforeEach('Create Temporary Review', function (done) {
			for (i = 0; i < 6; i++) {
				if (i == 0)
					tempGen.push(u2.username);
				else if (i == 1)
					tempGen.push(u1.username);
				else if (i == 2)
					tempGen.push(p1.id);
				else
					tempGen.push(Math.floor((Math.random() * 100000)).toString());
			}
			tempReview = createReview(tempGen[0], tempGen[1], tempGen[2], tempGen[3], tempGen[4], tempGen[5], tempGen[6]);
			databaseFile.insertReview(db, tempReview);
			sleep(100);
			done();
		});
		
		afterEach('Delete Temporary Posting', function (done) {
			databaseFile.deleteReview(db, tempGen[2], tempGen[0]);	
			sleep(100);
			done();
		});
		
		describe('Verify Reviews', function () {
			it('getReview', function (done) {
				databaseFile.getReview(db, tempGen[2], tempGen[0], function (review) {
					expect(review.reviewer).to.equal(tempGen[0]);
					expect(review.reviewee).to.equal(tempGen[1]);
					expect(review.postID).to.equal(tempGen[2]);
					expect(review.date).to.equal(tempGen[3]);
					expect(review.rating).to.equal(tempGen[4]);
					expect(review.comment).to.equal(tempGen[5]);
					done();
				});
			});
		});
	});
});	

// === In Progress ===



/*
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



	