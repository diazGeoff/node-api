module.exports = {
	'checkNotEmpty': (request, keys) => {
		keys.forEach(key => {
			request.checkBody(key, `${key} is empty`).notEmpty();
		});
	},
	'checkIsString': (request, keys) => {
		keys.forEach(key => {
			request.checkBody(key, `${key} is not string`).isString();
		});
	},
	'registerValidatorSchema': request => {
		request.checkBody({
			'email': {			
				'isEmail': {
					'errorMessage': 'Invalid Email'
				}
			},
			'password': {
				'isLength': {
					'options': [{min: 6}],
					'errorMessage': 'must be at least 6 characters'
				},
				'matches': {
					'options': ['^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])' ],
					'errorMessage': 'must have at least 1 uppercase and 1 symbol'
				}
			}
		});
	}
}