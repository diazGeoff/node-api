var bcrypt = require('bcrypt-nodejs');

let database = {
	"insert": (db, collectionName, queryParams, data) => {
		let collection = db.collection(collectionName);

		return new Promise( (resolve, reject) => {

			collection.findOne( queryParams, (err, item) => {
				if (err) return reject(err);

				if (item) return reject( {
					'message': 'User Exists'
				} );

				collection.insert(data, {'w': 1}, (err, result) => {
					return resolve(result);
				} );
					
			} );

		} );
	},
	"find": (db, collectionName, queryParams) => {
		let collection = db.collection(collectionName);

		return new Promise( (resolve, reject) => {			
			collection.findOne( queryParams, (err, item) => {
				if (err && !item) return reject(err);

				return resolve(item);
			} );
		} );
	},
	"update": (db, collectionName, queryParams, data) => {
		let collection = db.collection(collectionName);

		return new Promise( (resolve, reject) => {
			collection.updateOne( queryParams, {$set: data}, {upsert: true, w: 1}, (err, item) => {
				if (err) return reject(err);

				database.find(db, collectionName, queryParams)
					.then( updatedItem => resolve(updatedItem) )
					.catch( findErr => reject(findErr) );
			} );
		} );
	}
}

module.exports = database;