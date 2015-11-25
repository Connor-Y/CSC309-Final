var expect = require('chai').expect;
var db = require( __dirpath + "DB"); //

// Database Testing
describe("Database", function() {
	before(function() {
		// Create database here
		var db = connect(); ...	
	});
	
	describe("Database check", function () {
		// Check that the database exists
		if("db connection", function () {
			assert.isNotNull(db);
		});
	});
	
	describe("User Functions", function () {
		before(function () {
			var email1 = "email@test.com";
			var name1 = "Alice";
			var pass1 = "123pass";
			var user1 = createUser(email1, name1, pass1);
			db.insertUser(user1);
			
			var email2 = "email@test.com";
			var name2 = "Alice";
			var pass2 = "123pass";
			var user2 = createUser(email2, name2, pass2);
			db.insertUser(user2);
			
			var email3 = "email@test.com";
			var name3 = "Alice";
			var pass3 = "123pass";
			var user3 = createUser(email3, name3, pass3);
			db.insertUser(user3);
		});
		
		describe("Check User", function () {
			before("getUsers", function () {
				var userA = getUser(email1);
				var userB = getUser(email2);
				var userC = getUser(email3);
			});
			// If you can't access name ... make them semi-global
			it('user1', function() {
				expect(userA.name).to.equal(name1);
				expect(userA.pass).to.equal(pass1);
				expect(userA.email).to.equal(email1);
			});
			
			it('user2', function() {
				expect(userB.name).to.equal(name2);
				expect(userB.pass).to.equal(pass2);
				expect(userB.email).to.equal(email2);
			});
			
			it('user3', function() {
				expect(userC.email).to.equal(email3);
				expect(userC.name).to.equal(name3);
				expect(userC.pass).to.equal(pass3);
			});
		});	
		
		describe("Update User", function () {
			it('Update name', function () {
				var newName = Math.floor((Math.random() * 10000)).toString();
				updateUser(email, newName, ...);
				expect((getUser(email).name).to.equal(newName));
			});
			
			// Security?
			it('Update pass', function () {
				var newPass = Math.floor((Math.random() * 10000)).toString();
				updateUser(email, newPass, ...);
				expect((getUser(email).pass).to.equal(newPass));
			});
			// Other updates ...
		});
		
		describe("Delete User", function () {
			before('tempUser', function () {
				var email = Math.floor((Math.random() * 10000)).toString();
				var newUser = createUser(email, "temp2", ...);
				db.insertUser(newUser)
				var temp = db.getUser(newUser.email);
			});
			
			it('Delete user', function () {
				db.removeUser(temp/newUser);
				expect(db.getuser(email).to.be.null);
			});
		});
	});
	
	describe('Listing Functions', function () {
		before('Add Listings', function() {
			// Add Listings here
			// Randomize key
			
			var email1 = "email@test.com";
			var name1 = "Alice";
			var pass1 = "123pass";
			var user1 = createUser(email1, name1, pass1);
			db.insertUser(user1);
			
			var email2 = "email@test.com";
			var name2 = "Alice";
			var pass2 = "123pass";
			var user2 = createUser(email2, name2, pass2);
			db.insertUser(user2);
			
			var email3 = "email@test.com";
			var name3 = "Alice";
			var pass3 = "123pass";
			var user3 = createUser(email3, name3, pass3);
			db.insertUser(user3);
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