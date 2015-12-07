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

var validPassword = function(password, storedpassword) {
    return bcrypt.compareSync(password, storedpassword);
};

var generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

var expressHbs = require('express3-handlebars');
app.engine('hbs', expressHbs({
    extname: 'hbs',
    defaultLayout: 'main.hbs'
}));
app.set('view engine', 'hbs');

app.use(express.static(__dirname + '/public', {maxAge: 86400000}));
app.use(express.static(__dirname + '/public/html', {maxAge: 86400000})));
app.use(express.static(__dirname + '/public/css', {maxAge: 86400000})));
app.use(express.static(__dirname + '/public/javascript', {maxAge: 86400000})));


app.use(sess({
    cookieName: 'sess',
    secret: 'kauKoG0TtFB2LxpLRXMH',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
}));

//default
sess.username = '';
sess.email = '';
sess.game = '';

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());


app.get('/', function(req, res) { //main page not logged in
    res.sendFile(__dirname + '/public/html/mainpage.html');
});



app.get('/main', function(req, res) { //main page logged in
    //res.sendFile(__dirname + '/public/html/login.html');
    console.log("logged in to main page");
    console.log(sess.username);
    res.render('mainPageView', {
        username: sess.username,
        layout: 'mainPage'
    });
});

app.get('/login', function(req, res) {
    console.log("got to the login page");
    res.sendFile(__dirname + '/public/html/login.html');
    //	res.render('loginView', {layout:'login'});
});

app.get("/myuserpage", function(req, res) {
    console.log("got to my user page");
    db.getUserByUsername(db.db, sess.username, function(user) {
        if (user) {
            //res.json(user);
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

app.get("/usersearch", function(req, res) {
    console.log("got to the user search page");
    res.render('usersearchView', {
        username: sess.username,
        layout: 'usersearch'
    });
});
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

app.get("/admin", function(req, res) {
	res.render("adminView", {username: sess.username, layout: 'admin'});
});

app.get("/superadmin", function(req, res) {
	res.render("superadminView", {username: sess.username, layout: 'superadmin'});
});


app.get("/userpost", function(req, res) {
    console.log("got to the user post game page");
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
app.post("/list", function (req, res) {
	console.log("got to the /list path");
	console.log(req.body.query);

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

//testing
app.get("/remove", function() {
	db.removeall(db.db, function () {
		res.send("removed all posts");
	});
});

app.get("/removeusers", function() {
	db.removeallusers(db.db, function () {
		res.send("removed all users");
	});
});

app.get("/removereviews", function() {
	db.removeallreviews(db.db, function () {
		res.send("removed all reviews");
	});
});

app.get("/allposts", function(req, res) {
	db.getAvailablePosts(db.db, function(posts) {
		res.send(posts);
	});
});

app.get("/allusers", function(req, res) {
	db.getAllUsers(db.db, function(users) {
		res.send(users);
	});
});

app.get("/allreviews", function(req, res) {
	db.getAllReviews (db.db, function(users) {
		res.send(users);
	});
});






app.get('/404', function() {
    res.sendFile(__dirname + '/public/html/404.html');
});

app.listen(PORT);

// ====



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

        db.userExists(db.db, req.body.username, req.body.email, function(result) {
            //a user was found when the email and username queried
            if (result) {
                console.log("User already exists");
                res.send("Invalid");
            } else {

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

app.post("/loginVerification", function(req, res) {
	
    console.log("Login Request Received");
    db.userExists(db.db, sanitizeHtml(req.body.username), sanitizeHtml(req.body.email), function(result) {
        console.log("" + req.body.username);
        console.log("" + sanitizeHtml(req.body.username));
        console.log("" + req.body.password);
        console.log("" + sanitizeHtml(req.body.password));

        //a user was found when the email was queried
        if (result) {
            console.log("User exists");
            
            db.getUserByUsername(db.db, sanitizeHtml(req.body.username), function(user) {
                console.log("the password is" + user.password);
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
            console.log("Not Found");
            res.send("Not Found");
        }
    });

    

  });

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

app.get("/logout", function(req, res) {
    sess.username = '';
    sess.email = '';

    console.log("logout successful");
    //res.send("Success");
    res.redirect("/");


});


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

app.get("/users", function(req, res) {
	console.log("hi");
	
	username = 	req.query.username;	
	console.log(username);

    console.log("profile view request received");

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




/*User*/
app.post("/updateDescription", function(req, res) {
    console.log(req.body.description);
    db.updateUserDescription(db.db, sess.username, sanitizeHtml(req.body.description));
    res.send("Success");
    //res.redirect(req.get('referer'));   		
});

app.post("/updateUsername", function(req, res) {
    console.log(req.body.username);
    db.updateUserName(db.db, sess.username, sanitizeHtml(req.body.username));
    sess.username = req.body.username;
    res.send("Success");
    //res.redirect(req.get('referer'));   		
});



//should validate old password on server side
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

app.post("/updatePassword", function(req, res) {
    console.log(req.body.password);
    db.updateUserPassword(db.db, sess.username, generateHash(req.body.password));
    res.send("Success");
    //res.redirect(req.get('referer'));   		
});

app.post("/updatePic", function(req, res) {
    console.log(req.body.pic);
    db.updateUserPic(db.db, sess.username, sanitizeHtml(req.body.pic));
    res.send("Success");
    //res.redirect(req.get('referer'));   		
});

//Post update


//Admin Update functions
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




app.post("/updateUserRating", function (req, res) {
	console.log("updating the user rank");
//	db.updateUserRating(db.db, sanitizeHtml(req.params.username), sanitizeHtml(req.params.rating));
//	res.send("Success");

 	 db.getUserByUsername(db.db, sanitizeHtml(req.body.username), function (user) {
        if (user) {
            //res.json(user);
            console.log("found")
            console.log(sanitizeHtml(req.body.rating));
            db.updateUserRating(db.db, sanitizeHtml(req.body.username), sanitizeHtml(req.body.rating));

            res.send("Success");
        }
        
        else {
        	console.log("cannot find")

            res.send("Not Found, try again!");
        }
    }); 
});

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


app.post("/toggleAdmin" , function (req, res) {
    
    console.log("admin toggle request received");
    //console.log("" + req.body.username);
    //console.log("" + req.body.email);
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




app.post("/createPosting", function (req, res) {
	console.log("got to create a posting");

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
app.get("/allreviews", function(req, res) {
	db.getAllReviews(db.db, function(users) {
		res.send(users);
	});
});

  		

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

app.post("/makeUnavailable", function(req, res) {
	console.log("made posting unavailable");
    // id refers to the posting's id
    console.log(sess.game);
    db.makeUnavailable(db.db, sess.game, sess.username);//req.params.buyerUsername);
	res.redirect("myuserpage");//check to see if working
    });

app.post("/getRentedGamesByUsername", function(req, res) {
    db.getPostsBoughtBy(db.db, sess.username, function(posts) {
        res.send(posts);
    });
});

app.post("/getGameReviewsByPostID", function(req, res) {
    db.getReviewsByID(db.db, sanitizeHtml(req.body.postID), function(reviews) {
        res.send(reviews);
    });
});

app.post("/getUserReviewsFrom", function(req, res) {
    db.getReviewsFrom(db.db, sanitizeHtml(req.body.username), function(reviews) {
    res.send(reviews);
    });
});

app.post("/getUserReviewsAbout", function(req, res) {
    db.getReviewsAbout(db.db, sanitizeHtml(req.body.username), function(reviews) {
    res.send(reviews);
    });
});


app.post('/getGamesByQuery', function(req, res) {
    db.getAvailablePosts(db.db, function(posts) {
        var results = searchPostings(sanitizeHtml(req.body.query), posts);
        res.send(results)
    });
});

app.post("/getRecommendations", function(req, res) {
	getRec(req.body._id, function (results) {
		console.log("Results: " + results);
		res.send(results);
	});
});

app.get("/getrectest", function(req, res) {
	getRec("5664d03233ac4a54152b17f7", function (results) {
		console.log("Results: " + results);
		res.send(results);
	});
});

app.get("/allAvailable", function (req, res) {
	db.getAvailablePosts(db.db, function (posts) {
		res.send(posts)
	});
});

function getRec(id, next) {
	//console.log("id: " + id);
	  db.getPostByID(db.db, id, function(post) {
		  //console.log("get");
        if (post) {
			//console.log("Current Post: "+ JSON.stringify(post));
			var tags = "";
			for (var k = 0; k < post.tags.length; k++) {
				tags = tags + ", " + post.tags[k];
			}
            tags = tags.split(", ");
            var lowSimTags = tags.slice();
            var recList = [];
			
            tags = shuffleArray(tags);
            tags = tags.slice(0, Math.ceil(tags.length * recommendationSimiliarityFactor) + 1);
			lowSimTags = tags.slice(0, 2);
            console.log("Tags: " + tags);
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

app.get("/searchTest", function (req, res) {
	    db.getAvailablePosts(db.db, function(posts) {
        var results = searchPostings("d, e", posts);
        // TODO: Format results
        res.send(results)
    });
});

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


function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

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



// ***** Old Code for Facebook Verification *****
// Feel free to use/change it to work.

/*
// This is called with the results from from FB.getLoginStatus().
  function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
 $("#main").load("landing.php");
    } else {
moveTo('/');
    }
  }
  
  // This function is called when someone finishes with the Login
  // Button.  See the onlogin handler attached to it in the sample
  // code below.
  function checkLoginState() {
    FB.getLoginStatus(function(response) {
      //statusChangeCallback(response);
return response.status;
    });
  }
  window.fbAsyncInit = function() {
  FB.init({
    appId      : '1098933153474400',
    cookie     : true,  // enable cookies to allow the server to access
                        // the session
    xfbml      : true,  // parse social plugins on this page
    version    : 'v2.2' // use version 2.2
  });
  // Now that we've initialized the JavaScript SDK, we call
  // FB.getLoginStatus().  This function gets the state of the
  // person visiting this page and can return one of three states to
  // the callback you provide.  They can be:
  //
  // 1. Logged into your app ('connected')
  // 2. Logged into Facebook, but not your app ('not_authorized')
  // 3. Not logged into Facebook and can't tell if they are logged into
  //    your app or not.
  //
  // These three cases are handled in the callback function.
  
  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });
  };
  
  // Load the SDK asynchronously
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));
  
*/


/*
// Code from A4
app.post("/loadTable", function (req, res) {
console.log("Load Table");
User.find( function (err, users) {
if (err) {
console.log("Load Table Error");
} else {
res.send(users);
}
});
});
app.post("/registration", function (req, res) {
console.log("Registration Request Received");
User.findOne({ email: req.body.mail }, function (err, user) {
if (err) {
console.log(err);
res.send("Error");
}
if (req.body.mail == undefined || req.body.pass == undefined){
res.send("Invalid");
return false;
}
if (user == null) {
console.log("New User");
var firstUser = false;
User.findOne({}, function (err, result) {
console.log("Result: " + result);
if (err) {
console.log(err);
res.redirect('/');
}
if (result == null)
firstUser = true;
var newUser;
console.log("first: " + firstUser)
if (firstUser === true)
newUser = new User({username: req.body.mail, password: req.body.pass, type:"super", email:req.body.mail, image: "default.png", desc: ""});
else
newUser = new User({username: req.body.mail, password: req.body.pass, type:"user", email:req.body.mail, image: "default.png", desc: ""});
newUser.save();
res.send("Success");
});
}
else {
console.log("User already exists");
res.send("User Exists");
}
});
});
app.post("/setView", function (req, res) {
console.log("setView");
if (sess != undefined) {
sess.view = req.body.mail;
User.findOne({email: req.body.mail}, function (err, user) {
if (err) {
console.log("Error: " + err)
sess.targetType = null;
} else {
sess.targetType = user.type;
addLog(sess.view);
}
});
}
});
app.post("/profile", function (req, res) {
console.log("Profile Request Received");
console.log("Goto: " + req.body.sessView); 
User.findOne({ email: req.body.sessView }, function (err, user) {
if (err) {
console.log(err);
res.send("Error");
}
if (user == undefined) {
console.log("User doesn't exist error");
res.send("Error");
} else {
console.log("Success");
res.send(user);
}
});
});
app.post("/getSession", function (req, res) {
console.log("Session Request");
if (sess == undefined)
res.send(JSON.stringify({result: "Invalid"}));
else {
var temp = {sessMail: sess.email, sessType: sess.type, sessView: sess.view, sessTargetType: sess.targetType};
res.send(JSON.stringify(temp));
}
});
app.post("/saveProfile", function (req, res) {
console.log("Save Profile Request");
//console.log(req.body);
if (req.body.username != '')
userUpdate(req.body.mail, 'username', req.body.username);
if (req.body.desc != '')
userUpdate(req.body.mail, 'desc', req.body.desc);
res.redirect('profile');
});
app.post("/deleteProfile", function (req, res) {
console.log("Delete Profile Request");
console.log(req.body);
User.findOneAndRemove({ email: req.body.sessView}, function (err) {
if (err) {
console.log("Error: " + err);
res.send("Error");
return false;
}
});
if (req.body.sessView == req.body.sessMail)
sess.email = "";
sess.view = "index";
res.send("Success");
});
app.post("/changePassword", function (req, res) {
console.log("Change Password");
User.findOne({ "email": req.body.sessView }, 
function (err, user) {
if (err) {
console.log("changePass Error " + err);
res.send("Error"); 
return false;
}
if (user == undefined) {
res.send("Error");
}
if (req.body.oldPass === user.password) { 
var ret = userUpdate(req.body.sessView, 'password', req.body.newPass);
if (ret !== false)
res.send("Success");
else {
res.send("Error");
return false;
}
}
else {
res.send("Invalid"); 
}
});
});
app.post("/toggleAdmin", function (req, res) {
if (req.body.sessTargetType == 'admin') {
userUpdate(req.body.sessView, 'type', 'user');
sess.targetType = 'user';
res.send(req.body.sessView + " is now an User");
}
else {
userUpdate(req.body.sessView, 'type', 'admin');
sess.targetType = 'admin';
res.send(req.body.sessView + " is now an Admin");
}
});
app.post("/logInfo", function (req, res) {
addLog(req.body);
res.send("Success");
});
app.post("/loadMetrics", function (req, res) {
console.log("Load Metrics");
if (sess == undefined || sess.type == 'user') {
res.send("Invalid");
}
else {
console.log("find");
Metric.find({}, function (err, metrics) {
if (err)
res.send("Error");
else {
res.send(JSON.stringify(metrics));
}
});
}
});
app.post("/logout", function (req, res) {
if (sess == undefined)
res.send("Invalid");
else {
sess = undefined;
res.send("Success");
}
});
app.get("*", function (req, res) {
res.redirect('/');
});
app.listen(PORT);
*/

/*
// Database code below
function userUpdate (target, field, newInfo) {
console.log("User Update");
if (target == undefined)
return false;
if (newInfo == '')
return false;
var updatedField = {};
updatedField[field] = newInfo;
console.log(updatedField);
User.findOneAndUpdate({ email: target }, { $set: updatedField },
function (err) {
if (err) {
console.log("Error: " + err);
return false;
}
});
}
function addLog (data) {
var curUser;
if (sess == undefined || sess.email == undefined)
curUser = "";
else
curUser = sess.email;
// TODO: get ip
var curIP = '0';
var curLat = data.lati;
var curLong = data.longi;
var curOS = data.os;
var curBrowser = data.browser;
var curPage;
if (data.pg == "profile" || data.pg == "editProfile")
curPage = data.pg + "/" + sess.view;
else
curPage = data.pg;
var newLog = new Metric({user: curUser, ip: curIP, latitude: curLat, longitude: curLong, os: curOS, browser: curBrowser, page: curPage});
newLog.save();
}
mongoose.connect('mongodb://localhost/DB', PORT);
var db = mongoose.connection;
db.on('error', console.error.bind(console, "Connection error:"));
db.once('open', function (callback) {
console.log.bind("Database Loaded"); });
var userSchema = mongoose.Schema({
username: { type: String, required: true },
password: { type: String, required: true },
type: { type: String, required: true },
email: { type: String, required: true, unique: true },
image: String,
desc: String,
});
var metricSchema = mongoose.Schema({
user: String,
ip: String,
latitude: String,
longitude: String,
os: String,
browser: String,
page: String
});
console.log("Schema built");
var User = mongoose.model('User', userSchema, uniqueTestDB);
var Metric = mongoose.model('Metric', metricSchema, uniqueMetricDB);
console.log("Model Created");
<<<<<<< HEAD
*/

