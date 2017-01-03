var Joi = require('joi');
var elasticsearch = require('elasticsearch');

var env = require('../env');

// Elasticsearch client
var client = new elasticsearch.Client({
	host: env.elastic_host + ':' + env.elastic_port,
	log: 'error'
});

module.exports.route = {
	method: 'GET',
	path: '/species/{id}',
	handler: function (request, reply) {
		// Query's parameters
		var id = request.params.id;

		var params = {
			index: env.elastic_data_index,
			type: env.elastic_data_type,
			ignore: [404],
			id: id
		};

		client.get(params).then(function (resp) {
			if (!resp.found) {
				reply(resp).code(404);
			} else {
				reply(resp);
			}
		}, function (err) {
			console.log(err.message);
		});
	},
	config: {
		tags: ['api'],
		description: 'Get details for a single species',
		notes: 'Returns the species',
		validate: {
			params: {
				id: Joi.string()
					.required()
					.min(1)
					.description('The species\' identifier (_id)')
			}
		}
	}
};