var expect = require('chai').expect;
var db = require( __dirpath + "DB"); //

// Helper Functions
function createNoHashUser(mail, name, pass) {
	var newUser = {email: mail, username: name, password: pass};
	return newUser;
	
});

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
		db.insertUser(db, user3);
	});
	
	describe("Database check", function () {
		// Check that the database exists
		if("db connection", function () {
			assert.isNotNull(db);
		});
	});
	
	describe("User Functions", function () {			
		describe("Check User", function () {
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
				updateUserInfo(db, getUserByUsername(name1));
				expect(getUserByUsername(newName).name).to.equal(newName));
			});
			
			
			it('Update Description', function () {
				var newPass = Math.floor((Math.random() * 10000)).toString();
				updateUser(email, newPass, ...);
				expect((getUser(email).pass).to.equal(newPass));
			});
			
			// Security?
			it('Update pass', function () {
				var newDesc = Math.floor((Math.random() * 10000)).toString();
				updateUserInfo(db, getUserByUsername(name1));
				expect(getUserByUsername(name1).description).to.equal(newDesc));
			});
			
		});
		
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
	
	describe('Listing Functions', function () {
		before('Add Listings', function() {
			// Add Listings here
			// Randomize key
			
		
		});
		
		it('Verify Listing', function () {
			// Check that the listings exist
			
			
		});
		
		
		it('Update Listing', function () {
			// Update listing and verify 
			
			
			
		});
		
		describe('Delete Function', function() {
			before('Create deletable listing', function () {
				// Create deletable listing here
				
			});
				
			it('Delete Listing', function () {
				// Delete above listing
				// expect(listing).to.be.null;
				
			});
		});
		
		describe('Listing Comments', function () {
			before('Listing Comments', function () {
				// Create comments on listings
				
				// Create comments on games
				
				// Create comments on users
				
			});
			
			decribe('Verify Listing', function () {
				it('Listing 1, Comment 1', function () {
					// expect L1C1 = get(L1C1)
					
				});
				it('Listing 1, Comment 3', function () {
					// expect L1C3 = get(L1C3)
					
				});
				it('Listing 2, Comment 2', function () {
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
		
	});
	
});