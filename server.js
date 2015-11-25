var fs = require('fs');
var path = require('path');
var PORT = 3000;

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var db = require('./DB');
var User = db.User;

app.use(express.static( __dirname + '/public/html'));
app.use(express.static( __dirname + '/public/css'));
app.use(express.static( __dirname + '/public/javascript'));
app.use(bodyParser.json());


app.get('/', function (req, res) {
	res.sendFile(__dirname + '/public/html/index.html');
});


app.listen(PORT);
/*
app.post("/loginVerification", function (req, res) {
	console.log("Login Request Received");
	User.findOne({ "email": req.body.mail }, 
	function (err, user) {
		if (err) {
			console.log("verifyLogin Error " + err);
			res.send("An Error Has Occurred, Please Try Again"); 
		}
		if (user == undefined)
			return false;
		if (req.body.pass === user.password) { 
			console.log("Valid Login");
			sess=req.session;
			sess.email = req.body.mail;
			sess.type = user.type;
			sess.view = "landing";
			sess.targetType = null;
			userUpdate(req.body.mail, 'ip', req.body.ip);
			res.send("Success");
		}
		else {
			console.log("Invalid Login");
			res.send("Invalid Login"); 
		}
	});
});

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


