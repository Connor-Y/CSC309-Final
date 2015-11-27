var fs = require('fs');
var path = require('path');
var PORT = 3000;

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var db = require('./DB');
var User = db.User;

// How similar recommendations should be by
// number of tags
var recommendationSimiliarityFactor = 0.8;
// How many recommendations do you want
var numberOfRecs = 4;

app.use(express.static( __dirname + '/public/html'));
app.use(express.static( __dirname + '/public/css'));
app.use(express.static( __dirname + '/public/javascript'));
app.use(bodyParser.json());


app.get('/', function (req, res) {
	res.sendFile(__dirname + '/public/html/mainpage.html');
});


app.listen(PORT);

var generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

app.post("/registration", function (req, res) {
	console.log("Registration Request Received");
	userExists(db, { email: req.body.mail }, function (result) {
		
        //a user was found when the email was queried
        if (result) {
            console.log("User already exists");
			res.send("User Exists");
        }

        else {
            console.log("New User");
            insertUser(db, {email : req.body.mail, username : req.body.username, password : generateHash(req.body.password)});
        }
    });
});



app.post("/loginVerification", function (req, res) {
	console.log("Login Request Received");
	userExists(db, { email: req.body.mail }, function (result) {
		
        //a user was found when the email was queried
        if (result) {
            console.log("User exists");
			validateUser(db, req.body.mail, generateHash(req.body.password), function (valid) {
               if (!valid) {
                   console.log("Invalid Password");
                   res.send("Invalid Password");
               }
                
                else {
                    
                    console.log("Successful Login");
                    //res.sendFile(__dirname + '/mainpage.html');
                    res.send("Success");
                }
                
            });
        }

        else {
            console.log("Invalid User");
            res.send("Invalid User");
        }
    });
});

//searching by tag
app.post("/searchtag", function (req, res) {
	console.log("search request received");
	getPostsFrom(db, req.body.mail, function (posts) {
		
        //a user was found when the email was queried
        if (posts) {
            console.log("Matching posts found");
			res.json(posts);
        }

        else {
            console.log("No match");
            res.send("No match");
        }
    });
});

//searching by user
app.post("/searchuser", function (req, res) {
	console.log("search request received");
	getMatchingPosts(db, req.body.tag, function (posts) {
		
        //a user was found when the email was queried
        if (posts) {
            console.log("Matching posts found");
			res.json(posts);
        }

        else {
            console.log("No match");
            res.send("No match");
        }
    });
});


app.post("/profile", function (req, res) {
    console.log("profile view request received");
    
    getUserByUsername(db, req.body.mail, function (user) {
        if (user) {
            res.json(user);
        }
        
        else {
            res.send("Cannot find user in database");
        }
    });
});


app.get("/post:id", function (req, res) {
    console.log("post retrieval request received");
    
    getPostByID(db, req.params.id, function(post) {
        if (post) {
            res.json(post);   
        }
        
        else {
            res.send("No post with this ID");
        }
        
    });

});


// ====

app.post("/recommendations", function (req, res) {
	console.log("Generate and Send Recommendations");
	// Need database code for games
	getPostByID(db, req.params.id, function(post) {
		if (post) {
			// Pick some/all tags
			// Find games with similar tags
			// Send game info
			// TODO: set to actual delimiter
			var tags = post.tags.split(" ");
			var lowSimTags = tags.slice();
			tags = shuffleArray(tags);
			tags = tags.slice(0, Math.ceil(tags.length * recommendationSimiliarityFactor) + 1);
			
			var recList = getGamesByTag(db, tags);
			
			// If we don't have enough recommendations, relax the similarity
			if (recList.length < numberOfRecs) {
				lowSimTags = lowSimTags.slice(0, Math.ceil(lowSimTags.length * recommendationSimiliarityFactor * 0.5) + 1);
				recList = recList.concat(getGamesByTag(db, tags));
			}
			// Shuffle the recommendations we have
			recList = shuffleArray(recList);
			
			// If we still don't have enough recommendations
			// Pick some random games to fill out the number.
			if (recList.length < numberOfRecs) {
				// Just pick some random games
				recList = recList.concat(getGamesByTag(db, ""));
			}
			recList = recList.slice(0, numberOfRecs + 1);
			// TODO: format recList
			res.send(recList);
		} else { 
			res.redirect('/404');
		}	
	});
});

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}



app.get('/404', function () {
	res.send('404.html');
});

/*

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


