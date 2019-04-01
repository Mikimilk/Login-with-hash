var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var crypto = require('crypto');

function hashPassword(password, salt) {
  var sum = crypto.createHash('sha256');
  sum.update(password + salt);
  return 'sha256$'+ sum.digest('hex');
}

var connection = mysql.createConnection({
	host     : 'remotemysql.com',
	user     : 'cDn4wxnoFL',
	password : 'Wxga14YBjp',
	database : 'cDn4wxnoFL',
	port	 : '3306'     
});

var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});

app.get('/register', function(request, response) {
	response.sendFile(path.join(__dirname + '/register.html'));
});

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = hashPassword(request.body.password);
	if (username && password) {
		connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.post('/register', function(request, response) {
	var users = {
		username : request.body.username,
		password : hashPassword(request.body.password)
	}
	if (users.username && users.password) {
		connection.query("INSERT INTO users SET ?",users, function (error, results, fields) {
			if (error) {
				response.send('There are some errors with query');
			}else{
				response.send('user registered sucessfully');
			}		
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		response.send('Welcome back, ' + request.session.username + '!');
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});

app.listen(3000);
