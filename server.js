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
var recommendationSimiliarityFactor = 0.8;
// How many recommendations do you want
var numberOfRecs = 4;

var validPassword = function(password, storedpassword) {
    return bcrypt.compareSync(password, storedpassword);
};

var generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

var expressHbs = require('express3-handlebars');
app.engine('hbs', expressHbs({extname:'hbs', defaultLayout:'main.hbs'}));
app.set('view engine', 'hbs');

app.use(express.static(__dirname + '/public'));
app.use(express.static( __dirname + '/public/html'));
app.use(express.static( __dirname + '/public/css'));
app.use(express.static( __dirname + '/public/javascript'));

app.use(sess({
  cookieName: 'sess',
  secret: 'kauKoG0TtFB2LxpLRXMH',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

//default
sess.username = '';
sess.email = '';

app.use(bodyParser.urlencoded({
        extended: true
    }));

app.use(bodyParser.json());


app.get('/', function (req, res) { //main page not logged in
	res.sendFile(__dirname + '/public/html/mainpage.html');
});

app.get('/start', function (req, res) { //main page not logged in
	res.sendFile(__dirname + '/public/html/mainpage.html');
});


app.get('/main', function (req, res) { //main page logged in
	//res.sendFile(__dirname + '/public/html/login.html');
	console.log("logged in to main page");
	console.log(sess.username);
	res.render('mainPageView', {username: sess.username, layout:'mainPage'});

});

app.get('/login', function(req, res) {
	console.log("got to the login page");
	res.sendFile(__dirname + '/public/html/login.html');
//	res.render('loginView', {layout:'login'});

});

app.get("/myuserpage", function(req, res) {
	console.log("got to my user page");
	db.getUserByUsername(db.db, sess.username, function (user) {
        if (user) {
            //res.json(user);
            res.render('myPageView', {username: sess.username, rating: user.rating , email: user.email , description: user.description, layout:'mypage'});

        }
        
        else {
            res.send("Not Found"); //did not find the 
        }
    }); 

//	res.render('myPageView', {username: sess.username, layout:'mypage'});

});

app.get("/usersearch", function(req, res) {
	console.log("got to the user search page");
	res.render('usersearchView', {username: sess.username, layout: 'usersearch'});
});
/*
app.get("/userpage", function(req, res) {
	
});
*/
/*
app.get("/getall", function(req, res) {
	console.log("trying to get all 
});
*/
app.get("/userupdate", function(req, res) {
	console.log("got to the user update page");
	res.render('userupdateView', {username: sess.username, layout: 'userupdate'});

});

app.get("/userpost", function(req, res) {
	console.log("got to the user post game page");
	res.render('userpostView', {username: sess.username, layout: 'userpost'});

});



app.get('/404', function () {
	res.sendFile(__dirname + '/public/html/404.html');
});

app.listen(PORT);

// ====


app.post("/getSession", function (req, res) {
	console.log("Session Request");
	if ((sess.username == '') || (sess.email == '')) {
		res.send(JSON.stringify({result: "Invalid"}));
    }
	else {
		var temp = {sessmail: sess.email, sessusername: sess.username};
		res.send(JSON.stringify(temp));
    }
});
        
app.post("/registration", function (req, res) {
    
    console.log("Registration Request Received");
    //get rid of possible script in all fields
    req.body.password = sanitizeHtml(req.body.password);
    req.body.username = sanitizeHtml(req.body.username);
    req.body.email = sanitizeHtml(req.body.email);
    
    if ((req.body.password == '' ) || (req.body.username == '') || (req.body.email == '')) {
            console.log("script detected!");
            res.send("Invalid");
    }
    
    else {
        
        
        //console.log("" + req.body.username);
        //console.log("" + req.body.email);
        //console.log("" + req.body.password);
        
        db.userExists(db.db, req.body.username, req.body.email, function (result) {
        //a user was found when the email and username queried
           if (result) {
                console.log("User already exists");
                res.send("Invalid");
            }

            else {
            
                req.body.password = generateHash(req.body.password);
                console.log("New User");
                db.insertUser(db.db, req.body);
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



app.post("/loginVerification", function (req, res) {
	console.log("Login Request Received");
	db.userExists(db.db, sanitizeHtml(req.body.username), sanitizeHtml(req.body.email), function (result) {
		
        console.log("" + req.body.username);
        console.log("" + sanitizeHtml(req.body.username));
        console.log("" + req.body.password);
        console.log("" + sanitizeHtml(req.body.password));
        
        //a user was found when the email was queried
        if (result) {
            console.log("User exists");
            
            db.getUserByUsername(db.db, sanitizeHtml(req.body.username), function (user) {
                console.log("the password is" + user.password);
                if (!validPassword(req.body.password, user.password)) {
                   console.log("Invalid Password");
                   res.send("Invalid");
                }  
                
                else {
                    console.log("Successful Login");                           
                    sess.email = sanitizeHtml(user.email);
                    sess.username = sanitizeHtml(req.body.username);
					//res.send("Success");
					res.redirect("main"); //log in to the main page.
                }
                
            });
        } else {
            console.log("Not Found");
            res.send("Not Found");
        }
    });
});
        
app.get("/logout", function (req, res) {
    sess.username = '';
    sess.email = '';
    
    console.log("logout successful");
    //res.send("Success");
    res.redirect("start");

    
});

app.post("/profile", function (req, res) {
    console.log("profile view request received");
    
    db.getUserByUsername(db.db, sanitizeHtml(req.body.username), function (user) {
        if (user) {
            //res.json(user);
            res.render("userpageView", {user: user, layout: "userpage"});
        }
        
        else {
            res.send("Not Found, try again!");
        }
    }); 
});

app.post("/updateUserRating", function (req, res) {
	db.updateUserRating(db.db, sanitizeHtml(req.params.username), sanitizeHtml(req.params.rating));
	res.send("Success");
});



app.post("/updateUserInfo", function (req, res) {
	if (sess.username != req.params.username)
		res.send("Invalid");
	else {
		if (req.params.name !== "")
			db.updateUserName(db.db, {username: sanitizeHtml(req.params.username), name: sanitizeHtml(req.params.name)});
		if (req.params.description !== "")
			db.updateUserDescription(db.db, {username: sanitizeHtml(req.params.username), description: sanitizeHtml(req.params.description)});
	}
});

//password must be hashed first generateHash(req.body.password)


app.post("/getPostsFromUsername", function (req, res) {
	db.getPostsFrom(db.db, sanitizeHtml(req.params.username), function (posts) {
		if (post) {
			res.send(post);
		} else
			res.send("Not Found");
		
	});
	
});


app.get("/post:id", function (req, res) {
    console.log("post retrieval request received");
    
    db.getPostByID(db.db, sanitizeHtml(req.params.id), function(post) {
        if (post) {
            res.json(post);   
        }
        
        else {
            res.send("Not Found");
        } 
    });
});

app.post("/createPosting", function (req, res) {
	var posting = createPosting(sanitizeHtml(req.params.username), req.params.id, req.params.date, sanitizeHtml(req.params.title),
		sanitizeHtml(req.params.price)
		sanitizeHtml(req.params.content), sanitizeHtml(req.params.image), sanitizeHtml(req.params.tags));
	
    if ((sanitizeHtml(req.params.content) == '') || (sanitizeHtml(req.params.username) == '') || (sanitizeHtml(req.params.tags) == '')) {
        res.send("Invalid");
    }
    
    else {
        db.insertPost(db.db, posting);
        res.send("Success");  
    }
});

app.post("/createReview", function (req, res) {
	var review = createReview(sanatizeHtml(req.params.reviewer), sanatizeHtml(req.params.reviewee), req.params.id, 
	req.params.date, req.params.rating, sanatizeHtml(req.params.comment));
    
    
    if ((sanitizeHtml(req.params.reviewer) == '') || (sanitizeHtml(req.params.reviewee) == '') || (sanitizeHtml(req.params.comment) == '')) {
        res.send("Invalid");
    }
    
    else {
	   db.insertReview(db.db, review);
	   res.send("Success");    
    }
});

app.post("/deleteUserByID", function (req, res) {
	db.deletePost(db.db, sanitizeHtml(req.params.id));
	res.send("Success");
	
});

app.post("/makeUnavailable", function (req, res) {
	// id refers to the posting's id
	db.makeUnavailable(db.db, sanitizeHtml(req.params.id), req.params.buyerUsername);
	res.send("Success");
	
});

app.post("/getRentedGamesByUsername", function (req, res) {
	db.getPostsBoughtBy(db.db, sess.username, function (posts) {
	res.send(posts);
	});	
});

app.post("/getGameReviewsByPostID", function (req, res) {
	db.getReviewsByID(db.db, sanitizeHtml(req.params.postID), function (reviews) {
		res.send(reviews);
	});
});

app.post("/getUserReviewsByUsername", function (req, res) {
	db.getReviewsFrom(db.db, sanitizeHtml(req.params.username), function (reviews) {
		res.send(reviews);
	});
});

app.post('/getGamesByQuery', function (req, res) {
	db.getAvailablePosts(db.db, function (posts) {
		var results = searchPostings(sanitizeHtml(req.params.query), posts);
		// TODO: Format results
		res.send(results)
	});
});

app.post("/getRecommendations", function (req, res) {
	console.log("Generate and Send Recommendations");
	// Need database code for games
	db.getPostByID(db.db, sanitizeHtml(req.params.id), function(post) {
		if (post) {
			// TODO: set to actual delimiter
			var tags = post.tags.split(" ");
			var lowSimTags = tags.slice();
			tags = shuffleArray(tags);
			tags = tags.slice(0, Math.ceil(tags.length * recommendationSimiliarityFactor) + 1);
			
			var recList = db.getPostsByTag(db.db, tags);
			// If we don't have enough recommendations, relax the similarity
			if (recList.length < numberOfRecs) {
				lowSimTags = lowSimTags.slice(0, Math.ceil(lowSimTags.length * recommendationSimiliarityFactor * 0.5) + 1);
				recList = recList.concat(db.getPostsByTag(db.db, tags));
			}
			
			// Strip copies of the same game
			for (elem in recList) {
				if (elem.title == post.title)
					recList.splice(recList.indexOf(elem), 1);
			}
			// Shuffle the recommendations we have
			recList = shuffleArray(recList);
			
			
			// Strip copies of the same game
			for (elem in recList) {
				if (elem.title == post.title)
					recList.splice(recList.indexOf(elem), 1);
			}
			// If we still don't have enough recommendations
			// Pick some random games to fill out the number.
			if (recList.length < numberOfRecs) {
				// Just pick some random games

				recList = recList.concat(db.getPostsByTag(db.db, ""));
				// Strip copies of the same game
				for (elem in recList) {
					if (elem.title == post.title)
						recList.splice(recList.indexOf(elem), 1);
				}

			}
	
			recList = recList.slice(0, numberOfRecs + 1);
			// TODO: format recList
			res.send(recList);
		} else { 
			res.send('Not Found');
		}	
	});
});

function getDate() {
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();

	if(dd<10) {
  	  dd='0'+dd
	} 

	if(mm<10) {
  	  mm='0'+mm
	} 

	today = mm+'/'+dd+'/'+yyyy;
	return today;
}



function searchPostings(q, postings) {
	var results = [];
	var query = q.trim();
	query = query.replace(",", " ");
	for (elem in postings) {
		if (elem.title == query)
			results.push(elem);
		// Multiple ifs to arrange results in order of priority
		else if (elem.username == query) 
			results.push(elem);
		else if (elem.id == query)
			results.push(elem);
		else {
			// TODO: set proper tag delimiter
			var tags = elem.tags.split(" ");
			var splitQuery = query.split(" ");
			for (val in splitQuery) {
				if (tags.indexOf(val) > -1) {
					results.push(elem);
					break;
				}
			}
		}
	}
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

function createPosting(username, id, date, title, content, tags) {
	var newPost = {username: username, id: id, date: date, title: title,
					postContent: content, tags: tags};
	return newPost
}

function createReview(reviewer, reviewee, id, date, rating, comment) {
	var newReview = {reviewer: reviewer, reviewee: reviewee, postID: id, 
	date: date, rating: rating, comment: comment};
	
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
*/


