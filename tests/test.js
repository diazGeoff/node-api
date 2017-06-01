var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../index');
var random = require('randomstring');

var should = chai.should();

chai.use(chaiHttp);

describe('API', () => {
	let userData = {
		'email': `${random.generate(7)}@local.com`,
		'firstname': 'Test',
		'lastname': 'HyperStacks',
		'password': `${random.generate(5)}Password@200`
	};

	describe('User', () => {
		it('should create user if the fields are correctly filled up', done => {
			
			chai.request(server)
				.post('/register')
				.send(userData)
				.then(res => {
					res.should.have.status(200);
					res.body.message.should.be.equal('Registered');
					done();
				})
				.catch(err => done(err));
		});
		it('should return error if email exists', done => {
			chai.request(server)
				.post('/register')
				.send(userData)
				.catch( err => {
					err.should.have.status(409);					
					done();
				} );
		});		

		it('should return new data when updated', done => {
			chai.request(server)
				.post('/login')
				.send({'email': userData.email, 'password': userData.password})
				.then(res => {					
					userData.firstname = "Test Updated";
					userData.lastname = "HyperStacks Updated";
					userData.password = `${random.generate(5)}Password@2000`;
					chai.request(server)
						.post('/update')
						.set('Authorization', `Bearer ${res.body.token}`)
						.send(userData)
						.then(res => {
							res.should.have.status(200);
							res.body.should.have.property('_id');
							done();
						})
						.catch(err => done(err));
				} )
				.catch(err => done(err));
		});
	});

	describe('Authentication', () => {
		let token;

		it('should return token when logged in', done => {
			chai.request(server)
				.post('/login')
				.send({'email': userData.email, 'password': userData.password})
				.then(res => {					
					res.should.have.status(200);
					res.body.should.have.property('token');
					res.body.token.should.be.a('string');
					token = res.body.token;
					done();
				})
				.catch(err => done(err));
		});
		it('token should be authenticated', done => {
			chai.request(server)
				.post('/check')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.body.authorized.should.be.true;
					done();
				})
				.catch(err => done(err));
		});		
	});	
});