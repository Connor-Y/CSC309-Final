var expect = require('chai').expect;
var db = require("../DB"); 

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
// Database Testing
describe("Database", function() {
	var db;
	before(function() {
		var url = 'mongodb://localhost:27017/VGExchange';
		MongoClient.connect(url, function(err, database) {
			assert.equal(null, err);
			console.log("Connected to DB");
			db = database;
		});
		
	});
	
	describe("Database check", function () {
		// Check that the database exists
		it("db connection", function () {
			assert.isNotNull(db);
		});
	});
	
	describe("User Functions", function () {	
		before("Create Users", function () {
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
			insertUser(db, user1);
			insertUser(db, user2);
			insertUser(db, user3);
		});
		
		describe("Verify Users", function () {
			before("getUsers", function () {
				var userA = getUserByUsername(name1);
				var userB = getUserByUsername(name2);
				var userC = getUserByUsername(name3);
			});

			it('user1 check', function() {
				expect(userA.username).to.equal(name1);
				expect(userA.email).to.equal(email1);
			});
			
			it('user2 check', function() {
				expect(userB.username).to.equal(name2);
				expect(userB.email).to.equal(email2);
			});
			
			it('user3 check', function() {
				expect(userC.username).to.equal(name3);
				expect(userC.email).to.equal(email3);
			});
		});	
		
		describe("Update User", function () {
			it('Update name', function () {
				var newName = Math.floor((Math.random() * 10000)).toString();
				var updatedUser = getUserByUsername(name1);
				updatedUser.name = newName;
				updateUserInfo(db, updatedUser);
				expect(getUserByUsername(name1).name.to.equal(newName));
			});
			
			
			it('Update Description', function () {
				var newDesc = Math.floor((Math.random() * 10000)).toString();
				var updatedUser = getUserByUsername(name1);
				updatedUser.description = newDesc;
				updateUserInfo(db, updatedUser);
				expect(getUserByUsername(name1).description.to.equal(newDesc));

			});
			
			// Security?
			/* TODO: Implement
			it('Update pass', function () {
				var newPass = Math.floor((Math.random() * 10000)).toString();
				updateUser(email, newPass, ...);
				expect((getUser(email).pass).to.equal(newPass));
			}); 
			
		});*/
		
		describe("Delete User", function () {
			before('tempUser', function () {
				var gen = Math.floor((Math.random() * 10000)).toString();
				var newUser = createNoHashUser(gen, gen, "pass");
				insertUser(db, newUser)
			});
			// What does getUserByUsername return if not existent?
			it('Delete user', function () {
				deleteUser(db, gen);
				expect(db.getUserByUsername(gen).to.be.null);
			});
		});
	});
	
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
		
		/*
		describe('Update Posting', function () {
			before('Get Postings', function () {
				var testP1 = getPostByID(db, gen[1]);
				var testP2 = getPostByID(db, gen[8]);
				var testP3 = getPostByID(db, gen[15]);
				var testP4 = getPostByID(db, gen[21]);	
			});
			
			it('Update', function () {
				
				
			});
			
			
		}); */
		/*
		describe('Delete Function', function() {
			before('Create deletable listing', function () {
				// Create deletable listing here
				
			});
				
			it('Delete Posting', function () {
				// Delete above listing
				// expect(listing).to.be.null;
				
			});
		});
		
		describe('Posting Comments', function () {
			before('Posting Comments', function () {
				// Create comments on listings
				
				// Create comments on games
				
				// Create comments on users
				
			});
			
			decribe('Verify Posting', function () {
				it('Posting 1, Comment 1', function () {
					// expect L1C1 = get(L1C1)
					
				});
				it('Posting 1, Comment 3', function () {
					// expect L1C3 = get(L1C3)
					
				});
				it('Posting 2, Comment 2', function () {
					// expect L2C2 = get(L2C2)
					
				});
			});
			
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
				// Create ratings on various listings
				
				// Create ratings on users
				
				// Create rating on games
			});
			
			// See above for tests
		});
		*/
	});
	
});