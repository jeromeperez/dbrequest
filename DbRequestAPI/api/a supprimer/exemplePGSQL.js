var Joi = require('joi');
var elasticsearch = require('elasticsearch');
var fs = require('fs');
var GeoPoint = require('geopoint');
var request = require('request');
var _ = require('underscore');

var env = require('../env');

// Elasticsearch client
var client = new elasticsearch.Client({
	host: env.elastic_host + ':' + env.elastic_port,
	log: 'error'
});

// API configuration
var default_from = env.api_default_from;
var default_size = env.api_default_size;
var default_min_size = env.api_default_min_size;
var default_max_size = env.api_default_max_size;
var default_include_facets = env.api_default_include_facets;
var default_min_score = env.api_default_min_score;
var default_slop = env.api_default_slop;

module.exports.route = {
	method: 'GET',
	path: '/species',
	handler: function (request, reply) {
		var custom_error = {
			statusCode: 400,
			error: "Bad request",
			message: " is not allowed to be empty",
			validation: {
				source: "query",
				keys: []
			}
		};

		var query = JSON.parse(fs.readFileSync('./api/api_species_default_query.json').toString()).query;
		var facets = JSON.parse(fs.readFileSync('./api/api_species_default_facets.json').toString()).facets;

		// Query's parameters
		var from = request.query['from'] || default_from;
		var size = request.query['size'] || default_size;

		var include_facets = request.query['include_facets'] || default_include_facets;

		var family = request.query['family'] || null;
		var genus = request.query['genus'] || null;

		var usage_cat = request.query['usage_cat'] || null;
		var usage_type = request.query['usage_type'] || null;

		var search = request.query['search'] || null;

		var latitude = request.query['latitude'] || null;
		var longitude = request.query['longitude'] || null;

		var sort_by = request.query['sort_by'] || null;

		var params = {
			index: env.elastic_data_index,
			type: env.elastic_data_type,
			ignore: [404],
			from: from,
			size: size,
			body: {
				query: query,
				sort: [
					'name.untouched'
				]
			}
		};

		if (sort_by != null) {
			if (sort_by == 'family') {
				params.body.sort = [];
				params.body.sort.push('family.name.untouched');
				params.body.sort.push('name.untouched');
			} else if (sort_by == 'score') {
				params.body.sort = [];
			}
		}

		if (include_facets) {
			params.body['aggs'] = facets;
		}

		if (usage_cat != null) {
			params.body.query.bool.must[0].nested.query.bool.must.push({
				match: { 'usages.usage.untouched': usage_cat }
			});

			if (include_facets) {
				var tmp = JSON.parse(JSON.stringify(params.body.aggs.sub_usages.aggs));
				params.body.aggs.sub_usages.aggs['filtered'] = {
					filter: {
						term: { 'usages.usage.untouched': usage_cat }
					},
					aggs: tmp
				};
			}
		}

		if (usage_type != null) {
			params.body.query.bool.must[0].nested.query.bool.must.push({
				match: { 'usages.names.untouched': usage_type }
			});

			if (include_facets) {
				var tmp = JSON.parse(JSON.stringify(params.body.aggs.usages.aggs));
				params.body.aggs.usages.aggs['filtered'] = {
					filter: {
						term: { 'usages.names.untouched': usage_type }
					},
					aggs: tmp
				};
			}
		}

		if (family != null) {
			params.body.query.bool.must.push({
				match: { 'family.name.untouched': family }
			});
		}

		if (genus != null) {
			params.body.query.bool.must.push({
				match: { 'genus.name.untouched': genus }
			});
		}

		if (search != null) {
			params.body['min_score'] = default_min_score;
			params.body.query.bool.must.push({
				match_phrase_prefix: {
					_all: { query: search, slop: default_slop }
				}
			});
		}

		if (latitude != null && longitude == null) {
			custom_error.message = 'longitude' + custom_error.message;
			custom_error.validation.keys.push('longitude');
			reply(custom_error).code(400);
			return;
		}

		if (longitude != null && latitude == null) {
			custom_error.message = 'latitude' + custom_error.message;
			custom_error.validation.keys.push('latitude');
			reply(custom_error).code(400);
			return;
		}

		if (latitude != null && longitude != null) {
			var point = new GeoPoint(latitude, longitude);
			var bounding = point.boundingCoordinates(env.gbif_geometry_distance_km, null, true);

			var top_left = { latitude: bounding[1]._degLat, longitude: bounding[0]._degLon };
			var top_right = { latitude: bounding[1]._degLat, longitude: bounding[1]._degLon };
			var bottom_right = { latitude: bounding[0]._degLat, longitude: bounding[1]._degLon };
			var bottom_left = { latitude: bounding[0]._degLat, longitude: bounding[0]._degLon };

			var wkt_geometry = 'POLYGON(('
				+ top_left.longitude + ' ' + top_left.latitude + ', '
				+ top_right.longitude + ' ' + top_right.latitude + ', '
				+ bottom_right.longitude + ' ' + bottom_right.latitude + ', '
				+ bottom_left.longitude + ' ' + bottom_left.latitude + ', '
				+ top_left.longitude + ' ' + top_left.latitude
				+ '))';
			
			var url = env.gbif_api_occurence_geometry + wkt_geometry;
			get_occurrences(url, 0, [], function(tab_ids) {
				tab_ids = _.unique(tab_ids);

				params.body.query.bool.must.push({
					constant_score: { filter: { in: { 'gbif_key': tab_ids } } }
				});

				client.search(params).then(function (resp) {
					reply(resp);
				}, function (err) {
					console.log(err.message);
				});
			});
		} else {
			client.search(params).then(function (resp) {
				reply(resp);
			}, function (err) {
				console.log(err.message);
			});
		}
	},
	config: {
		tags: ['api'],
		description: 'Get species list',
		notes: 'Returns the species list',
		validate: {
			query: {
				from: Joi.number().integer()
					.optional()
					.default(default_from)
					.min(default_from)
					.description(
						'The start index '
						+ '(default: ' + default_from + ', min: ' + default_from + ')'
					),

				size: Joi.number().integer()
					.optional()
					.default(default_size)
					.min(default_min_size)
					.max(default_max_size)
					.description(
						'The maximum number of results to return '
						+ '(default: ' + default_size + ', min: ' + default_min_size + ', max: ' + default_max_size + ')'
					),

				include_facets: Joi.boolean()
					.optional()
					.default(default_include_facets)
					.description(
						'Include the facets in the response\'s body '
						+ '(default: ' + default_include_facets + ')'
					),

				family: Joi.string()
					.optional()
					.min(1)
					.description('Family name filter'),

				genus: Joi.string()
					.optional()
					.min(1)
					.description('Genus name filter'),

				usage_cat: Joi.string()
					.optional()
					.min(1)
					.description('Usage category (first level) filter'),

				usage_type: Joi.string()
					.optional()
					.min(1)
					.description('Usage type (second level) filter'),

				search: Joi.string()
					.optional()
					.min(1)
					.description('Search filter - key words'),

				latitude: Joi.number()
					.optional()
					.min(-90)
					.max(90)
					.description('Latitude'),

				longitude: Joi.number()
					.optional()
					.min(-180)
					.max(180)
					.description('Longitude'),

				sort_by: Joi.string()
					.optional()
					.default('species')
					.valid('species', 'family', 'score')
					.description('Sorting results')
			}
		}
	}
};

var get_occurrences = function(url, offset, tab_ids, callback) {
	request(url + env.gbif_api_offset + offset, function (error, response, body) {
		if (!error && response.statusCode == 200 && response.headers['content-type'] == 'application/json') {
			var json = JSON.parse(body);
			if (json.results.length > 0) {
				json.results.forEach(function (result) {
					if (result.speciesKey) {
						tab_ids.push(result.speciesKey);
					}
				});
				if (json.endOfRecords) {
					callback(tab_ids);
				} else {
					get_occurrences(url, (offset + json.limit), tab_ids, callback);
				}
			} else {
				callback(tab_ids);
			}
		} else {
			callback([]);
		}
	});
}