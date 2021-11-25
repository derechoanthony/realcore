require('dotenv').config()
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var unirest = require("unirest");
var xmlParser = require('xml2json');


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

app.post('/auth', function(request, response) {
	let username = request.body.username;
    let password = request.body.password;
    /**
     * uname = matt.mason@avanidev.com
     * pwd = DamageInc.
     */
     if (username && password) {
        var req = unirest("GET", process.env.LOGIN_URL);
        req.query({
            "uname": username,
            "pw": password
        });
        req.headers({
            "postman-token": "df7dfc9d-d4e9-6b67-4934-965974baacc0",
            "cache-control": "no-cache",
            "content-type": "application/x-www-form-urlencoded"
        });

        req.end(function (res) {
            if (res.error) throw new Error(res.error);
            let xmldata = xmlParser.toJson(res.body);
            let data = JSON.parse(xmldata);
            let is_allowed = data.login.allowed;
            if(is_allowed == 'true'){
                request.session.loggedin = true;
				request.session.username = username;
                response.redirect('/home');
            }else{
                response.send('Incorrect Username and/or Password!');
            }

        });
    }else{
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

app.listen(process.env.PORT);