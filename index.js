var express = require('express');
var validator = require('express-validator');
var validatorServices = require('./services/validator-services');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var JWTExpress = require('express-jwt');
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

			return res.send(token);
		} 

		return res.status(401).json( {
			'err': 'Invalid User'
		} );
	});

app
	.post('/check', (req, res) => {

		return res.send('Authorized');
	});

app
	.post('/register', (req, res) => {		
		validatorServices.checkNotEmpty(req, [ 'email', 'firstname', 'lastname', 'password' ]);
		validatorServices.checkIsString(req, [ 'email', 'firstname', 'lastname', 'password' ]);
		validatorServices.registerValidatorSchema(req);

		req.getValidationResult().then(results => {
			res.json(results.array());
		});
	});

app.listen( 8080 , () => {
	console.log('Running on port 8080');
} );