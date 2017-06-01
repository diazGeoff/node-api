var express = require('express');
var validator = require('express-validator');
var validatorServices = require('./services/validator-services');
var db = require('./services/db');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var JWTExpress = require('express-jwt');
var mongoClient = require('mongodb').MongoClient;
var bcrypt = require('bcrypt-nodejs');
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

mongoClient.connect('mongodb://localhost:27017/node-api', (err, db) => {
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
		db.find( req.app.locals.database, 'users', { 'email': req.body.email } )
			.then( user => {

				if ( bcrypt.compareSync(req.body.password, user.password) ) {
					let token = jwt.sign( {
						'email': user.email
					} , secret, { expiresIn: 60 * 60 });

					return res.json( {
						'token': token
					} );
				}

				return res.status(401).json( {
					'message': 'Invalid Password'
				} );
			} )
			.catch( err => {
				return res.status(404).json( {
					'message': 'User Not Found'
				} );
			} );		
	});

app
	.post('/check', (req, res) => {

		return res.json({
			"authorized": true,
			"user": req.user
		});
	});

app
	.post('/update', (req, res) => {
		req.body.email = req.user.email;
		validatorServices.checkNotEmpty(req, [ 'email', 'firstname', 'lastname', 'password' ]);
		validatorServices.checkIsString(req, [ 'email', 'firstname', 'lastname', 'password' ]);
		validatorServices.schemaValidation(req);

		req.getValidationResult().then(results => {
			if (!results.isEmpty()) {
				return res.status(400).json(results.array());
			}
			req.body.password = bcrypt.hashSync(req.body.password);

			db.update(req.app.locals.database, 'users', {'email': req.body.email}, req.body)
				.then( updatedData => {
					return res.json( updatedData );
				} )
				.catch( err => {
					return res.status(409).json(err);
				} );
		});
	});

app
	.post('/register', (req, res) => {		
		validatorServices.checkNotEmpty(req, [ 'email', 'firstname', 'lastname', 'password' ]);
		validatorServices.checkIsString(req, [ 'email', 'firstname', 'lastname', 'password' ]);
		validatorServices.schemaValidation(req);

		req.getValidationResult().then(results => {
			if (!results.isEmpty()) {
				return res.status(400).json(results.array());
			}

			req.body.password = bcrypt.hashSync(req.body.password);

			db.insert(req.app.locals.database, 'users', {'email': req.body.email}, req.body)
				.then( result => {
					result.message = "Registered";
					return res.json(result);
				} )
				.catch( err => {
					return res.status(409).json(err);
				} );
		});
	});

app.listen( 8080 , () => {
	console.log('Running on port 8080');
} );

module.exports = app;