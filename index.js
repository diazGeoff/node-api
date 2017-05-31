var express = require('express');
var validator = require('express-validator');
var validatorServices = require('./services/validator-services');
var db = require('./services/db');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var JWTExpress = require('express-jwt');
var mongoClient = require('mongodb').MongoClient;
var secret = 'thisisasecret';
var app = express();

app.use(bodyParser.json());
app.use(validator({
	'customValidators': {
		'isString': value => {
			return (typeof value === 'string');
		}
	}
}));

mongoClient.connect('mongodb://localhost:9001/node-api', (err, db) => {
	if (!err) 
		return app.locals.database = db;
	else 
		console.log(err);
});

app.use(JWTExpress({
	'secret': secret	
}).unless({
	'path': [
		'/login',
		'/register'
	]
}));

app.use((err, req, res, next) => {	
	if ( err ) res.status(401).json(err);

	else next();
});


app
	.post('/login', (req, res) => {		
		if ( req.body.username === 'demo' && req.body.password === 'demo' ) {
			let token = jwt.sign({
				'name': 'HyperStacks',
				'address': 'USTP'
			}, secret, { expiresIn: 60 * 60 });			

			return res.json( {
				'token': token
			} );
		}

		return res.status(401).json( {
			'message': 'Invalid User'
		} );
	});

app
	.post('/check', (req, res) => {

		return res.json({
			"authorized": true
		});
	});

app
	.post('/register', (req, res) => {		
		validatorServices.checkNotEmpty(req, [ 'email', 'firstname', 'lastname', 'password' ]);
		validatorServices.checkIsString(req, [ 'email', 'firstname', 'lastname', 'password' ]);
		validatorServices.registerValidatorSchema(req);

		req.getValidationResult().then(results => {
			if (!results.isEmpty()) {
				return res.status(402).json(results.array());
			}

			db.insert(req.app.locals.database, 'users', req.body)
				.then( result => {
					return res.json(result);
				} )
				.catch( err => {
					return res.status(403).json(err);
				} );
		});
	});

app.listen( 8080 , () => {
	console.log('Running on port 8080');
} );

module.exports = app;