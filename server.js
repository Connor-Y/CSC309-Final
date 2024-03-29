var fs = require('fs');
var path = require('path');
var PORT = 3000;

var express = require('express');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');
var sanitizeHtml = require('sanitize-html');
var sess = require('client-sessions');

var app = express();

var db = require('./DB');

// How similar recommendations should be by
// number of tags
var recommendationSimiliarityFactor = 0.4;
// How many recommendations do you want
var numberOfRecs = 4;

// Validate password
var validPassword = function(password, storedpassword) {
    return bcrypt.compareSync(password, storedpassword);
};

// Generate a hash for the password
var generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// Handlebars for presentation
var expressHbs = require('express3-handlebars');
app.engine('hbs', expressHbs({
    extname: 'hbs',
    defaultLayout: 'main.hbs'
}));
app.set('view engine', 'hbs');

// Serve Static pages
app.use(express.static(__dirname + '/public', {maxAge: 86400000}));
app.use(express.static(__dirname + '/public/html', {maxAge: 86400000}));
app.use(express.static(__dirname + '/public/css', {maxAge: 86400000}));
app.use(express.static(__dirname + '/public/javascript', {maxAge: 86400000}));

// Create user session
app.use(sess({
    cookieName: 'sess',
    secret: 'kauKoG0TtFB2LxpLRXMH',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
}));

//default user session (not logged in)
sess.username = '';
sess.email = '';
sess.game = '';

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

// Redirect to main page (not logged in)
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/html/mainpage.html');
});


// Redirect to main page (logged in)
app.get('/main', function(req, res) { 
    //res.sendFile(__dirname + '/public/html/login.html');
    console.log(sess.username);
    res.render('mainPageView', {
        username: sess.username,
        layout: 'mainPage'
    });
});

// Redirect to the login page
app.get('/login', function(req, res) {
    res.sendFile(__dirname + '/public/html/login.html');
    //	res.render('loginView', {layout:'login'});
});

// Send a query to the database for profile information
// Then format that information and send it to front end.
app.get("/myuserpage", function(req, res) {
    db.getUserByUsername(db.db, sess.username, function(user) {
        if (user) {
            db.getPostsBoughtBy(db.db, sess.username, function(bought) {
            	db.getPostsFrom(db.db, sess.username, function(posts) {

                res.render('myPageView', {
                    user: user,
                    bought: bought,
                    posts: posts,
                    layout: 'mypage'
                });

            	});
			});

        } else {
            res.send("Not Found"); //did not find the 
        }
    });
    //	res.render('myPageView', {username: sess.username, layout:'mypage'});
});

// Render the user search page
app.get("/usersearch", function(req, res) {
    res.render('usersearchView', {
        username: sess.username,
        layout: 'usersearch'
    });
});

// Retrieve information from presentation layer 
// and send it to the database layer to update the database
app.get("/userupdate", function(req, res) {
    console.log("got to the user update page");

    db.getUserByUsername(db.db, sess.username, function(user) {
		if (user) {
			if (user.admintype == 2) {
				res.render('userupdateView', {
       			username: sess.username,
        		layout: 'userupdate'
    			});
	
			}
			else if (user.admintype ==1){
					res.redirect("admin");
				
				}
			else {
				res.redirect("superadmin");
			}
		}

	});

});

// Render the admin view
app.get("/admin", function(req, res) {
	res.render("adminView", {username: sess.username, layout: 'admin'});
});

// Render the superadmin view
app.get("/superadmin", function(req, res) {
	res.render("superadminView", {username: sess.username, layout: 'superadmin'});
});

// Render a user's post
app.get("/userpost", function(req, res) {
    res.render('userpostView', {
        username: sess.username,
        layout: 'userpost'
    });
});



/*
app.post('/getGamesByQuery', function (req, res) {
db.getAvailablePosts(db.db, function (posts) {
var results = searchPostings(sanitizeHtml(req.params.query), posts);
// TODO: Format results
res.send(results)
});
});
*/

// List through all available postings that match the given tags
app.post("/list", function (req, res) {
	db.getAvailablePosts(db.db, function (posts) { 
	//	var games = searchPostings(sanitizeHtml(req.body.query), posts);
		//res.send(results)
		//res.render("searchView", {games: games, layout:"search"});
		db.getPostsByTag(db.db, req.body.query, function(games) {
			res.render("searchView", {games: games, username:sess.username, layout:"search"});

		//res.send(games);

		});
	});
});

// Clear the database
app.get("/remove", function() {
	db.removeall(db.db, function () {
		res.send("removed all posts");
	});
});

// Remove all users
app.get("/removeusers", function() {
	db.removeallusers(db.db, function () {
		res.send("removed all users");
	});
});

// Remove all reviews
app.get("/removereviews", function() {
	db.removeallreviews(db.db, function () {
		res.send("removed all reviews");
	});
});

// Remove all posts
app.get("/allposts", function(req, res) {
	db.getAvailablePosts(db.db, function(posts) {
		res.send(posts);
	});
});

// Get all users
app.get("/allusers", function(req, res) {
	db.getAllUsers(db.db, function(users) {
		res.send(users);
	});
});

// Get all reviews
app.get("/allreviews", function(req, res) {
	db.getAllReviews (db.db, function(users) {
		res.send(users);
	});
});


// On 404, redirect to the main page.
app.get('/404', function() {
    res.sendFile(__dirname + '/public/html/mainpage.html');
});

app.listen(PORT);

// ====


// Get the current users session
app.post("/getSession", function(req, res) {
    console.log("Session Request");
    if (sess.email == '') {
        res.send(JSON.stringify({
            result: "Invalid"
        }));
    } else {
        var temp = {
            sessmail: sess.email,
            sessusername: sess.username
        };
        res.send(JSON.stringify(temp));
    }
});

// Logic to register a new user
app.post("/registration", function(req, res) {

    console.log("Registration Request Received");
    //get rid of possible script in all fields
    req.body.password = sanitizeHtml(req.body.password);
    req.body.username = sanitizeHtml(req.body.username);
    req.body.email = sanitizeHtml(req.body.email);

    if ((req.body.password == '') || (req.body.username == '') || (req.body.email == '')) {
        console.log("script detected!");
        res.send("Invalid");
    } else {
		// If the user already exists, return 'Invalid'
        db.userExists(db.db, req.body.username, req.body.email, function(result) {
            //a user was found when the email and username queried
            if (result) {
                console.log("User already exists");
                res.send("Invalid");
            } else {
				// Otherwise, generate a new user in the database
				// and redirect to the main page
                req.body.password = generateHash(req.body.password);
                console.log("New User");
                db.insertUser(db.db, req.body, false);
                //res.send("Success");

                //ADD STUFF TO SESSION AS NEEDED
                sess.email = req.body.email;
                sess.username = req.body.username;
                //bring the user to the main page logged in
                res.redirect("main");
            }
        });
    }

});

// Verify a users credentials when logging in.
app.post("/loginVerification", function(req, res) {
	// Remove possible scripts from login fields
    db.userExists(db.db, sanitizeHtml(req.body.username), sanitizeHtml(req.body.email), function(result) {
        console.log("" + req.body.username);
        console.log("" + sanitizeHtml(req.body.username));
        console.log("" + req.body.password);
        console.log("" + sanitizeHtml(req.body.password));

        //a user was found when the email was queried
        if (result) {
			// Get the user's information from the database
            db.getUserByUsername(db.db, sanitizeHtml(req.body.username), function(user) {
                console.log("the password is" + user.password);
				// If they fail at logging in, send 'Invalid'
                if (!validPassword(req.body.password, user.password)) {
                    console.log("Invalid Password");
                    res.send("Invalid");
                } else if (!user.facebook) {
                    console.log("Successful Login");
                    console.log("logged in on " + getDate());

                    sess.email = sanitizeHtml(user.email);
                    sess.username = sanitizeHtml(req.body.username);
                    //res.send("Success");
                    res.redirect("main"); //log in to the main page.
                }
                else {
                    console.log("Trying to login a fb user with regular login");
                    res.send("Invalid");
                }
            });
        } else {
			// User not found in database
            console.log("Not Found");
            res.send("Not Found");
        }
    });

    

  });

// Login Script for facebook users
app.post("/fbLogin", function(req, res) {
    console.log("Facebook Login Request Received");
    db.userExists(db.db, sanitizeHtml(req.body.username), sanitizeHtml(req.body.email), function(result) {
        
        console.log("" + req.body.username);
        console.log("" + req.body.password);        
        
        //a user was found when the email was queried
        if (result) {
            console.log("User exists");
            console.log("" + req.body.email);
            db.getUserByEmail(db.db, sanitizeHtml(req.body.email), function(user) {
                console.log("the password is" + user.password);
                if (!validPassword(req.body.password, user.password)) {
                    console.log("Invalid Password");
                    res.send("Invalid");
                } else {
                    console.log("Successful Login");
                    console.log("logged in on " + getDate());

                    sess.email = sanitizeHtml(req.body.email);
                    sess.username = sanitizeHtml(req.body.username);
                    //res.send("Success");
                    res.redirect("main"); //log in to the main page.
                }

            });
        } else {
            console.log("New User");
            
            req.body.password = generateHash(req.body.email);
            db.insertUser(db.db, req.body, true);
            
            sess.email = req.body.email;
            sess.username = req.body.username;
            res.redirect("main");
        }
    });
});

// Logout from site and redirect to mainpage
app.get("/logout", function(req, res) {
    sess.username = '';
    sess.email = '';

    console.log("logout successful");
    //res.send("Success");
    res.redirect("/");


});

// Retrieve the requested profile from the database
app.post("/profile", function(req, res) {
    console.log("profile view request received");

    db.getUserByUsername(db.db, sanitizeHtml(req.body.username), function(user) {
        if (user) {
        	db.getPostsFrom(db.db, sanitizeHtml(req.body.username), function(posts) {
        		 db.getPostsBoughtBy(db.db, sess.username, function(bought) {


            	//res.json(user);
           	 		res.render("userpageView", {
            	    user: user,
            	    bought: bought,
                	posts: posts,
                	layout: "userpage"
					});
        		});
        	});
		}
        else {
            res.send("Not Found, try again!");
        }
    });
});

// Retrieve the requested user information from the database.
app.get("/users", function(req, res) {
	username = 	req.query.username;	
	console.log(username);

    db.getUserByUsername(db.db, username, function(user) {
        if (user) {
            //res.json(user);
            res.render("userpageView", {
                user: user,
                layout: "userpage"
            });
        } else {
            res.send("Not Found, try again!");
        }
    });
    
    
});

//the product page, click on link to 
app.get("/product", function (req, res) {
	gameId = req.query.productid;	
	console.log(gameId);
	//var recposts = getRec(gameId);
	console.log(gameId);
	//console.log(recposts);

	console.log("got to the product page");

    db.getPostByID(db.db, gameId, function(post) {
        if (post) {
        //	db.getPostsByTag(db.db, post.tags[0], function(posts) {
        	getRec(gameId, function(posts) {
        		db.getReviewsByID(db.db, sess.game, function(reviews) {
					
        			sess.game = post._id;

            		res.render("productView", {posts:posts, username: sess.username, game: post,reviews:reviews, layout:"product"});
				});
			});

        } else {
            res.send("Not Found");
        }
    });
	
});





// Update user's description
app.post("/updateDescription", function(req, res) {
    db.updateUserDescription(db.db, sess.username, sanitizeHtml(req.body.description));
    res.send("Success");
    //res.redirect(req.get('referer'));   		
});

// Update the sessions user
app.post("/updateUsername", function(req, res) {
    db.updateUserName(db.db, sess.username, sanitizeHtml(req.body.username));
    sess.username = req.body.username;
    res.send("Success");
    //res.redirect(req.get('referer'));   		
});



// Validate and update a user's password
app.post("/updateUserPassword", function (req, res) {
    
    //this may be redundant, but just makes sure user exists incase user tries to send request without
    //using actual front end. (some app like postman)
    db.userExists(db.db, sanitizeHtml(req.body.username), sanitizeHtml(req.body.email), function (result) {
        if (!result) {
           res.send("Invalid user");
        }
        
        else {
            db.getUserByUsername(db.db, sanitizeHtml(req.body.username), function (user) {
                //check that they entered their old password correctly
                if (!validPassword(req.body.password, user.password)) {
                    console.log("Invalid Password");
                    res.send("Invalid");
                }
                
                else {
                    console.log("Correct password entered...");
                    db.updateUserPassword(db.db, sanitizeHtml(req.body.username), generateHash(sanitizeHtml(req.body.newpassword)));
                    console.log("Password updated!");
                    res.send("Success");
                }
            });
        }   
    });
});

// Depreciated - updatePassword function. - Use '/updateUserPassword'
app.post("/updatePassword", function(req, res) {
    console.log(req.body.password);
    db.updateUserPassword(db.db, sess.username, generateHash(req.body.password));
    res.send("Success");
    //res.redirect(req.get('referer'));   		
});

// Update a User's profile picture 
app.post("/updatePic", function(req, res) {
    console.log(req.body.pic);
    db.updateUserPic(db.db, sess.username, sanitizeHtml(req.body.pic));
    res.send("Success");
    //res.redirect(req.get('referer'));   		
});

//Post update


// *** Admin Update functions ***
// Update another user's information
app.post("/updatePasswordA", function(req, res) {
    console.log(req.body.description);
    db.updateUserPassword(db.db,sanitizeHtml(req.body.username), generateHash(req.body.password));
    res.send("Success");
});

app.post("/updateDescriptionA", function(req, res) {
    console.log(req.body.description);
    db.updateUserDescription(db.db,sanitizeHtml(req.body.username), sanitizeHtml(req.body.description));
    res.send("Success");
    });


app.post("/updatePicA", function(req, res) {
    console.log(req.body.pic);
    db.updateUserPic(db.db,sanitizeHtml(req.body.username), sanitizeHtml(req.body.pic));//, function(data) {
    res.send("Success");
	/*	if (data) {
			res.send("Success");
		}
		else {
		res.send("Fail");

		}
	});	
	*/
});

app.post("/updateUsernameA", function(req, res) {
    console.log(req.body.newname);
    db.updateUserName(db.db,sanitizeHtml(req.body.username), sanitizeHtml(req.body.newname));
    res.send("Success");
 });



// Update the rating associated with a given user
app.post("/updateUserRating", function (req, res) {
	// Get requested user
 	 db.getUserByUsername(db.db, sanitizeHtml(req.body.username), function (user) {
        if (user) {
			// Update their rating
            db.updateUserRating(db.db, sanitizeHtml(req.body.username), sanitizeHtml(req.body.rating));

            res.send("Success");
        }
        
        else {
        	// Otherwise, user not found error
            res.send("Not Found, try again!");
        }
    }); 
});

// Update a user's name and/or description
app.post("/updateUserInfo", function(req, res) {
    if (sess.username != req.params.username)
        res.send("Invalid");
    else {
        if (req.params.name !== "")
            db.updateUserName(db.db, {
                username: sanitizeHtml(req.params.username),
                name: sanitizeHtml(req.params.name)
            });
        if (req.params.description !== "")
            db.updateUserDescription(db.db, {
                username: sanitizeHtml(req.params.username),
                description: sanitizeHtml(req.params.description)
            });
    }
});

// Toggle a user's class between regular and administrator.
app.post("/toggleAdmin" , function (req, res) {
   
    db.getUserByUsername(db.db,  sanitizeHtml(req.body.username), function(user) {
    	if (user) {

    		if (user.adminType == 0) {
				res.send("fail");
			}
			else {
    	        db.toggleAdmin(db.db, sanitizeHtml(req.body.username));
                console.log("admin status changed!");
                res.send("Success");
            }
		}
        
       	else {
			res.send("could not find user!");
		}

	});

});

// Retrieve the current user's user type.
app.get("/getcurrentadmin", function (req, res) {
    if (sess.username != '') {
        db.getUserByUsername(db.db, sess.username, function (user) {
            console.log("" + user.admintype);
            var temp = {admintype: user.admintype};
            res.send(JSON.stringify(temp));
        });
    }  
});

//password must be hashed first generateHash(req.body.password)
app.post("/getPostsFromUsername", function(req, res) {
    db.getPostsFrom(db.db, sanitizeHtml(req.params.username), function(posts) {
        if (post) {
            res.send(post);
        } else
            res.send("Not Found");
    });
});

// Retrive posting with id
app.post("/post:id", function(req, res) {
    console.log("post retrieval request received");

    db.getPostByID(db.db, sanitizeHtml(req.body.id), function(post) {
        if (post) {
            res.json(post);
        } else {
            res.send("Not Found");
        }
    });
});



// Generate a new posting with supplied information.
app.post("/createPosting", function (req, res) {
	// Sanitize all inputs to prevent inject attacks
	var id = sanitizeHtml(req.body.title) + sess.username;
	var tags = sanitizeHtml(req.body.tags).split(",");
	for (var i = 0; i < tags.length; i++)
   		 tags[i] = tags[i].trim();
   	console.log(tags[0]);
   	tags.push(sanitizeHtml(req.body.title));
	var date = getDate();//username, id, date, title, price, content, image, tags
	var posting = createPosting(sanitizeHtml(sess.username), id,  date, sanitizeHtml(req.body.title),
		sanitizeHtml(req.body.price),sanitizeHtml(req.body.content), sanitizeHtml(req.body.image), tags);
	
    if ((sanitizeHtml(req.body.content) == '') || (sanitizeHtml(req.body.username) == '') || (sanitizeHtml(req.body.tags) == '')) {
        res.send("Invalid");
    }
    else {
    console.log("created the new posting");
        db.insertPost(db.db, posting);
        res.send("Success");
    }
});

// Create a new review on a given game
//format is reviewer, reviewee, id, date, rating, comment
app.post("/createReview", function(req, res) {
	console.log("got to the create review");
	db.getPostByID(db.db, sess.game, function(game) {
		if (game) {																//the games id will be linked to the review
			 var review = createReview(sess.username, sanitizeHtml(game.username), (game._id),
       					 getDate(), req.body.rating, sanitizeHtml(req.body.comment));
		}
		else {
			res.send("could not find the game");
		}
       		 		
    	if ((sanitizeHtml(req.body.reviewer) == '') || (sanitizeHtml(req.body.reviewee) == '') || (sanitizeHtml(req.body.comment) == '')) {
        	res.send("Invalid");
    	} else {
        	db.insertReview(db.db, review);
        	res.redirect(req.get('referer'));   		
        	}
		});

	});
	
	
// Get all reviews from the database
app.get("/allreviews", function(req, res) {
	db.getAllReviews(db.db, function(users) {
		res.send(users);
	});
});

  		
// Remove a user from the database
app.post("/deleteUser", function(req, res) {
    db.deletePost(db.db, sanitizeHtml(req.body.username)); //function(data) {
    /*
    if (data) {
    	res.send("Success");
	}
	else {
		res.send("Fail");
	}
	});
*/
});

// Make a posting unavailable.
app.post("/makeUnavailable", function(req, res) {
	console.log("made posting unavailable");
    // id refers to the posting's id
    console.log(sess.game);
    db.makeUnavailable(db.db, sess.game, sess.username);//req.params.buyerUsername);
	res.redirect("myuserpage");//check to see if working
    });

// Retrieve a list of games rented by the supplied username
app.post("/getRentedGamesByUsername", function(req, res) {
    db.getPostsBoughtBy(db.db, sess.username, function(posts) {
        res.send(posts);
    });
});

// Retrieve the list of reviews on a given post
app.post("/getGameReviewsByPostID", function(req, res) {
    db.getReviewsByID(db.db, sanitizeHtml(req.body.postID), function(reviews) {
        res.send(reviews);
    });
});

// Retrieve a list of reviews by a given user
app.post("/getUserReviewsFrom", function(req, res) {
    db.getReviewsFrom(db.db, sanitizeHtml(req.body.username), function(reviews) {
    res.send(reviews);
    });
});

// Retrieve a list of reviews about the given user
app.post("/getUserReviewsAbout", function(req, res) {
    db.getReviewsAbout(db.db, sanitizeHtml(req.body.username), function(reviews) {
    res.send(reviews);
    });
});

// Retrieve a list of games that match the query
// Query supports name, tags, uploader and id  
app.post('/getGamesByQuery', function(req, res) {
    db.getAvailablePosts(db.db, function(posts) {
        var results = searchPostings(sanitizeHtml(req.body.query), posts);
        res.send(results)
    });
});

// Generate a list of recommendations based on the current game
// page you are viewing
app.post("/getRecommendations", function(req, res) {
	getRec(req.body._id, function (results) {
		console.log("Results: " + results);
		res.send(results);
	});
});

// Test Function - Displays a set of recommendations
app.get("/getrectest", function(req, res) {
	getRec("5664d03233ac4a54152b17f7", function (results) {
		console.log("Results: " + results);
		res.send(results);
	});
}); 

// Generate a list of all available games.
app.get("/allAvailable", function (req, res) {
	db.getAvailablePosts(db.db, function (posts) {
		res.send(posts)
	});
});

// Generate a list of recommendations based on the 
// given game id.
function getRec(id, next) {
	  // Get the current page info
	  db.getPostByID(db.db, id, function(post) {
        if (post) {
			// Get its tags
			var tags = "";
			for (var k = 0; k < post.tags.length; k++) {
				tags = tags + ", " + post.tags[k];
			}
            tags = tags.split(", ");
            var lowSimTags = tags.slice();
            var recList = [];
			
            tags = shuffleArray(tags);
			// Take a subset of the given tags to match for similarity with other games
            tags = tags.slice(0, Math.ceil(tags.length * recommendationSimiliarityFactor) + 1);
			lowSimTags = tags.slice(0, 2);
            // Get other available games
			db.getAvailablePosts(db.db, function (posts) {
				for (var i = 0; i < posts.length; i++) {
						if (recList.length >= numberOfRecs) {
								console.log("Found enough recs: " + recList);
								next(recList);
								break;
						}
						// Don't recommend the same game
						if (posts[i].title == post.title) {
							continue;
						}
						// If we have already recommend a game, don't recommend it again
						var skipFlag = false;
						for (var j = 0; j < recList.length; j++) {
								if (recList[j].title == posts[i].title)
									skipFlag = true;
						}
						if (skipFlag) {
							skipFlag = false;
							continue;
						} 
						var postTags = "";
						for (var k = 0; k < post.tags.length; k++) {
							postTags = postTags + ", " + posts[i].tags[k];
						}

						// For each game, check if tags are a subset
						if (isSubset(tags, postTags.split(", ")))
						   recList.push(posts[i]);
						
				}
				
				//Searching for less similar games	
				if (recList.length >= numberOfRecs) {
					next(recList);
					return ;
				}
				else {
					for (var i = 0; i < posts.length; i++) {
						var curTitle = posts[i].title;
						if (recList.length >= numberOfRecs) {
								//console.log("Found enough recs: " + recList);
								next(recList);
								return ;
						}
						
						console.log(curTitle);
						// Don't recommend the same game
						if (curTitle == post.title) {
							continue;
						}
						
						// If we have already recommend a game, don't recommend it again
						var skipFlag = false;
						for (var j = 0; j < recList.length; j++) {
							//console.log("Rec: " + recList[j].title + " cur: " +curTitle);
							if (recList[j].title == curTitle)
								skipFlag = true;
						}
						if (skipFlag == true) {
							//console.log("Skipping: " + curTitle);
							skipFlag = false;
							continue;
						}
						var postTags = "";
						for (var k = 0; k < post.tags.length; k++) {
							postTags = postTags + ", " + posts[i].tags[k];
						}
						// For each game, check if tags are a subset
						if (isSubset(lowSimTags, postTags.split(", ")))
						   recList.push(posts[i]);
					}
				}
				
				// If we don't have enough recommendations
				// Recommend things uploaded by the same user
				if (recList.length >= numberOfRecs) {
					next(recList);
					return ;
				} else {
					db.getPostsFrom(db.db, post.username, function (result) {
						var k = 0;

						while (recList.length < numberOfRecs) {
							if (k >= result.length)
								break;
							if (result[k].title != post.title)
								recList.push(result[k]);
							k = k + 1;
						}
						
						// If we still don't have enough recommendations
						// pick random games.
						if (recList.length >= numberOfRecs) {
							next(recList);
							return ;
						} else {
							var k = 0;
							while (recList.length < numberOfRecs) {
								if (k >= posts.length)
									break;
								if (posts[k].title != post.title)
									recList.push(posts[k]);
								k = k + 1;
							}
							
						}
						
						
						next(recList);	
					});
				}
				
			});
        } else {
            next("Not Found");
        }
    });
}

// Get a list of posts that match the given tags
// less the title
function getR(id) {
	db.getPostById(db.db, id, function(game) {
		var tagarray = game.tags;
		index = tagarray.indexOf(game.title);
		tagarray.splice(index, 1); //remove the title from the tag list
		db.getPostsByTag(db.db, tagarray[0], function(posts) {
			return posts;
		});
	});

}


// Generate the current date
function getDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }

    today = mm + '/' + dd + '/' + yyyy;
    return today;
}

// Testing Function
// Searches for a given query
app.get("/searchTest", function (req, res) {
	    db.getAvailablePosts(db.db, function(posts) {
        var results = searchPostings("d, e", posts);
        // TODO: Format results
        res.send(results)
    });
});

// Search through the list of postings
// Searches for title, tags, uploader, id
function searchPostings(q, postings) {
    var results = [];
    var query = q.trim();
    for (var j = 0; j < postings.length; j++) {
        if (postings[j].title == query)
            results.push(postings[j]);
        // Multiple ifs to arrange results in order of priority
        else if (postings[j].username == query)
            results.push(postings[j]);
        else if (postings[j].id == query)
            results.push(postings[j]);
 
                var tags = "";
				for (var k = 0; k < postings[j].tags.length; k++) {
					tags = tags + ", " + postings[j].tags[k];
				}
				tags = tags.split(", ");
                var splitQuery = query.split(" ");
                for (var i = 0; i < splitQuery.length; i++ ) {
                        if (tags.indexOf(splitQuery[i]) > -1) {
                                results.push(postings[j]);
                                break;
                        }

        }
        
    }
	
	// Strip copies of the same game
	for (var i = 0; i < results.length; i++) {
		for (var j = i + 1; j < results.length; j++) {
			if (results[i].id == results[j].id)
					results.splice(results.indexOf(results[j]), 1);
		}
	}
    return results;
}

// Check if sub is a subset of master
function isSubset(sub, master) {
        var found = false;
        for (var i = 0; i < sub.length; i++) {
                for (var j = 0; j < master.length; j++) {
                if (sub[i] == master[j]) {
                                found = true;
                                break;
                        }
            }
                if (!found) {
                        return false;
                }
                found = false;
        }
        return true;
}

// Shuffle an array
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

// Create a json object representing a posting
function createPosting(username, id, date, title, price, content, image, tags) {
    var newPost = {
        username: username,
        id: id,
        date: date,
        title: title,
        price: price,
        postContent: content,
        image:image,
        tags: tags
    };
    return newPost;
}
// Create a json object representing a review
function createReview(reviewer, reviewee, id, date, rating, comment) {
    var newReview = {
        reviewer: reviewer,
        reviewee: reviewee,
        postID: id,
        date: date,
        rating: rating,
        comment: comment
    };
    return newReview;
}

