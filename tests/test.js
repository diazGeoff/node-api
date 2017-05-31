var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../index');

var should = chai.should();

chai.use(chaiHttp);

describe('API', () => {
	describe('Create', () => {
		it('should register user if the fields are correctly filled up', done => {
			
			chai.request(server)
				.post('/register')
				.send({
					'email': 'test@local.com',
					'firstname': 'Test',
					'lastname': 'HyperStacks',
					'password': 'Password@200'
				})
				.then(res => {
					res.should.have.status(200);
					res.body.message.should.be.equal('Registered');
					done();
				})
				.catch(err => done(err));
		});
	});

	describe('Login', () => {
		let token;

		it('should return token when logged in', done => {
			chai.request(server)
				.post('/login')
				.send({'username': 'demo', 'password': 'demo'})
				.then(res => {					
					res.should.have.status(200);
					res.body.should.have.property('token');
					res.body.token.should.be.a('string');
					token = res.body.token;
					done();
				})
				.catch(done);
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
				.catch(done);
		});		
	});
});