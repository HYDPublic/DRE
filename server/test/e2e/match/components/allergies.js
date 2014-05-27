/*=======================================================================
Copyright 2013 Amida Technology Solutions (http://amida-tech.com)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
======================================================================*/

var expect = require('chai').expect;
var supertest = require('supertest');
var deploymentLocation = 'http://' + 'localhost' + ':' + '3000';
var databaseLocation = 'mongodb://' + 'localhost' + '/' + 'dre';
var api = supertest.agent(deploymentLocation);
var fs = require('fs');
var path = require('path');
var database = require('mongodb').Db;

function removeCollection(inputCollection, callback) {
	var db;
	database.connect(databaseLocation, function(err, dbase) {
		if (err) {
			throw err;
		}
		db = dbase;
		db.collection(inputCollection, function(err, coll) {
			if (err) {
				throw err;
			}
			coll.remove({}, function(err, results) {
				if (err) {
					throw err;
				}
				db.close();
				callback();
			});
		});
	});
}

function loadTestRecord(fileName, callback) {
	var filepath = path.join(__dirname, '../../../artifacts/test-r1.0/' + fileName);
	api.put('/api/v1/storage')
		.attach('file', filepath)
		.expect(200)
		.end(function(err, res) {
			if (err) {
				callback(err);
			}
			callback(null);
		});
}


describe('Pre Test Cleanup', function() {

	it('Remove Allergy Collections', function(done) {
		removeCollection('allergies', function(err) {
			if (err) {
				done(err);
			}
			removeCollection('allergymerges', function(err) {
				if (err) {
					done(err);
				}
				removeCollection('allergymatches', function(err) {
					if (err) {
						done(err);
					}
					done();
				});
			});
		});
	});

});


describe('Allergies API - Test New:', function() {

	before(function(done) {
		loadTestRecord('bluebutton-01-original.xml', function(err) {
			if (err) {
				done(err);
			} else {
				done();
			}
		});
	});

	it('Get Allergy Records', function(done) {
		api.get('/api/v1/record/allergies')
			.expect(200)
			.end(function(err, res) {
				if (err) {
					return done(err);
				}
				expect(res.body.allergies.length).to.equal(3);
				//console.log(res.body.allergies);
				done();
			});
	});

	it('Get Allergy Merge Records', function(done) {
		api.get('/api/v1/merges/allergies')
			.expect(200)
			.end(function(err, res) {
				if (err) {
					return done(err);
				}
				expect(res.body.merges.length).to.equal(3);
				for (var i in res.body.merges) {
					expect(res.body.merges[i].merge_reason).to.equal('new');
				}
				//console.log(res.body);
				done();
			});
	});

});

describe('Allergies API - Test Duplicate:', function() {

	before(function(done) {
		loadTestRecord('bluebutton-02-duplicate.xml', function(err) {
			if (err) {
				done(err);
			} else {
				done();
			}
		});
	});

	it('Get Allergy Records', function(done) {
		api.get('/api/v1/record/allergies')
			.expect(200)
			.end(function(err, res) {
				if (err) {
					return done(err);
				}
				expect(res.body.allergies.length).to.equal(3);
				done();
			});
	});

	it('Get Allergy Merge Records', function(done) {
		api.get('/api/v1/merges/allergies')
			.expect(200)
			.end(function(err, res) {
				if (err) {
					return done(err);
				}
				expect(res.body.merges.length).to.equal(6);
				var newCnt = 0;
				var dupCnt = 0;
				for (var i in res.body.merges) {
					if (res.body.merges[i].merge_reason === 'new') {
						newCnt++;
					}
					if (res.body.merges[i].merge_reason === 'duplicate') {
						dupCnt++;
					}
				}
				expect(newCnt).to.equal(3);
				expect(dupCnt).to.equal(3);
				done();
			});
	});


});

describe('Allergies API - Test New/Dupe Mix:', function() {

	before(function(done) {
		loadTestRecord('bluebutton-03-updated.xml', function(err) {
			if (err) {
				done(err);
			} else {
				done();
			}
		});
	});

	it('Get Allergies Records', function(done) {
		api.get('/api/v1/record/allergies')
			.expect(200)
			.end(function(err, res) {
				if (err) {
					return done(err);
				}
				expect(res.body.allergies.length).to.equal(5);
				done();
			});
	});

	it('Get Allergy Merge Records', function(done) {
		api.get('/api/v1/merges/allergies')
			.expect(200)
			.end(function(err, res) {
				if (err) {
					return done(err);
				}
				//console.log(res.body.merges);
				expect(res.body.merges.length).to.equal(11);
				var newCnt = 0;
				var dupCnt = 0;
				for (var i in res.body.merges) {
					if (res.body.merges[i].merge_reason === 'new') {
						newCnt++;
					}
					if (res.body.merges[i].merge_reason === 'duplicate') {
						dupCnt++;
					}
				}
				expect(newCnt).to.equal(5);
				expect(dupCnt).to.equal(6);
				done();
			});
	});
});

//Modified severity on 2nd and 3rd allergy.  Changed Nausea to Hives on first allergy.
describe('Allergies API - Test Partial Matches:', function() {

	before(function(done) {
		loadTestRecord('bluebutton-04-diff-source-partial-matches.xml', function(err) {
			if (err) {
				done(err);
			} else {
				done();
			}
		});
	});

	it('Get Allergy Records', function(done) {
		api.get('/api/v1/record/allergies')
			.expect(200)
			.end(function(err, res) {
				if (err) {
					return done(err);
				}
				expect(res.body.allergies.length).to.equal(5);
				done();
			});
	});

	it('Get Allergy Merge Records', function(done) {
		api.get('/api/v1/merges/allergies')
			.expect(200)
			.end(function(err, res) {
				if (err) {
					return done(err);
				}
				//console.log(res.body.merges);
				expect(res.body.merges.length).to.equal(11);
				var newCnt = 0;
				var dupCnt = 0;
				for (var i in res.body.merges) {
					if (res.body.merges[i].merge_reason === 'new') {
						newCnt++;
					}
					if (res.body.merges[i].merge_reason === 'duplicate') {
						dupCnt++;
					}
				}
				expect(newCnt).to.equal(5);
				expect(dupCnt).to.equal(6);
				done();
			});
	});

	it('Get Allergy Match Records', function(done) {
		api.get('/api/v1/matches/allergies')
			.expect(200)
			.end(function(err, res) {
				//console.log(JSON.stringify(res.body.matches, null, 10));
				expect(res.body.matches.length).to.equal(3);
				for (var i in res.body.matches) {
					expect(res.body.matches[i].entry_id.name).to.equal(res.body.matches[i].match_entry_id.name);
				}
				done();
			});
	});

	//TODO:  Test get partials api.

});

describe('Allergies API - Test Added Matches', function() {

it('Update Allergy Match Records', function(done) {

		var update_id = '';
		var match_id = '';

		api.get('/api/v1/matches/allergies')
			.expect(200)
			.end(function(err, res) {
				if (err) {
					done(err);
				} else {
					update_id = res.body.matches[0]._id;
					match_id = res.body.matches[0].match_entry_id._id;
					api.post('/api/v1/matches/allergies/' + update_id)
						.send({
							determination: "added"
						})
						.expect(200)
						.end(function(err, res) {
							if (err) {
								done(err);
							} else {
								api.get('/api/v1/record/allergies')
									.expect(200)
									.end(function(err, res) {
										//console.log(res.body);
										var total_allergies = 0;
										for (var iEntry in res.body.allergies) {
											if (res.body.allergies[iEntry]._id === match_id) {
												total_allergies++;
											}
										}
										expect(total_allergies).to.equal(1);
										done();
									});
							}
						});
				}
			});
	});

	it('Get Allergy Merge Records Post Added', function(done) {
		api.get('/api/v1/merges/allergies')
			.expect(200)
			.end(function(err, res) {
				if (err) {
					return done(err);
				}
				//console.log(res.body.merges);
				expect(res.body.merges.length).to.equal(12);
				var newCnt = 0;
				var dupCnt = 0;
				for (var i in res.body.merges) {
					if (res.body.merges[i].merge_reason === 'new') {
						newCnt++;
					}
					if (res.body.merges[i].merge_reason === 'duplicate') {
						dupCnt++;
					}
				}
				expect(newCnt).to.equal(6);
				expect(dupCnt).to.equal(6);
				done();
			});
	});

});




describe('Allergies API - Test Ignored Matches', function() {


	//TODO:  Test get partials api.

	it('Update Allergy Match Records Ignored', function(done) {

		var update_id = '';
		var match_id = '';

		api.get('/api/v1/matches/allergies')
			.expect(200)
			.end(function(err, res) {
				if (err) {
					done(err);
				} else {
					update_id = res.body.matches[0]._id;
					match_id = res.body.matches[0].match_entry_id._id;
					api.post('/api/v1/matches/allergies/' + update_id)
						.send({
							determination: "ignored"
						})
						.expect(200)
						.end(function(err, res) {
							if (err) {
								done(err);
							} else {
								api.get('/api/v1/record/allergies')
									.expect(200)
									.end(function(err, res) {
										expect(res.body.allergies.length).to.equal(6);
										done();
									});
							}
						});
				}
			});
	});

	it('Get Allergy Merge Records Post Added', function(done) {
		api.get('/api/v1/merges/allergies')
			.expect(200)
			.end(function(err, res) {
				if (err) {
					return done(err);
				}
				//console.log(res.body.merges);
				expect(res.body.merges.length).to.equal(12);
				var newCnt = 0;
				var dupCnt = 0;
				for (var i in res.body.merges) {
					if (res.body.merges[i].merge_reason === 'new') {
						newCnt++;
					}
					if (res.body.merges[i].merge_reason === 'duplicate') {
						dupCnt++;
					}
				}
				expect(newCnt).to.equal(6);
				expect(dupCnt).to.equal(6);
				done();
			});
	});

});


describe('Allergies API - Test Merged Matches', function() {


	//TODO:  Test get partials api.

	it('Update Allergy Match Records Merged', function(done) {

		var update_id = '';
		var match_id = '';

		api.get('/api/v1/matches/allergies')
			.expect(200)
			.end(function(err, res) {
				if (err) {
					done(err);
				} else {
					update_id = res.body.matches[0]._id;
					match_id = res.body.matches[0].match_entry_id._id;
					api.post('/api/v1/matches/allergies/' + update_id)
						.send({
							determination: "merged"
						})
						.expect(200)
						.end(function(err, res) {
							if (err) {
								done(err);
							} else {
								api.get('/api/v1/record/allergies')
									.expect(200)
									.end(function(err, res) {
										console.log(JSON.stringify(res.body, null, 10));
										done();
									});
							}
						});
				}
			});
	});

	it('Get Allergy Merge Records Post Merged', function(done) {
		api.get('/api/v1/merges/allergies')
			.expect(200)
			.end(function(err, res) {
				if (err) {
					return done(err);
				}
				//console.log(res.body.merges);
				expect(res.body.merges.length).to.equal(13);
				var newCnt = 0;
				var dupCnt = 0;
				var mrgCnt = 0
				for (var i in res.body.merges) {
					if (res.body.merges[i].merge_reason === 'new') {
						newCnt++;
					}
					if (res.body.merges[i].merge_reason === 'duplicate') {
						dupCnt++;
					}
					if (res.body.merges[i].merge_reason === 'update') {
						mrgCnt++;
					}
				}
				expect(newCnt).to.equal(6);
				expect(dupCnt).to.equal(6);
				expect(mrgCnt).to.equal(1);
				done();
			});
	});

});
