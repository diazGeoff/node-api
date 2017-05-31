module.exports = {
	"insert": (db, collectionName, data) => {
		let collection = db.collection(collectionName);

		return new Promise( (resolve, reject) => {

			collection.findOne( {'email': data.email}, (err, item) => {
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
	"find": (db, collectionName, credentials) => {
		let collection = db.collection(collectionName);

		return new Promise( (resolve, reject) => {			

		} );
	}
}