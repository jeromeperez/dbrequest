var Joi = require('joi');
var elasticsearch = require('elasticsearch');
var easyimg = require('easyimage');
var md5 = require('MD5');
var path = require('path');
var fs = require('fs');

var env = require('../env');

var json_error = {
	error: 'error'
}

// Elasticsearch client
var client = new elasticsearch.Client({
	host: env.elastic_host + ':' + env.elastic_port,
	log: 'error'
});

module.exports.route = {
	method: 'GET',
	path: '/image/{species_id}/{image_size}/{image_url}',
	handler: function (request, reply) {
		// Query's parameters
		var species_id = request.params.species_id;
		var image_size = request.params.image_size;
		var image_url = request.params.image_url;

		var params = {
			index: env.elastic_data_index,
			type: env.elastic_data_type,
			ignore: [404],
			id: species_id
		};

		client.get(params).then(function (resp) {
			if (resp.found && resp._source && resp._source.gbif_media && check_images(resp._source.gbif_media, image_url)) {

				var image_directory = (image_size == 'mini') ? env.images_mini_directory : env.images_normal_directory;
				var image_name = md5(image_url) + '_' + path.basename(image_url);
				var image_path = './' + image_directory + image_name;

				if (fs.existsSync(image_path)) {
					reply.file(image_path);
				} else {
					easyimg.info(image_url).then(function (file) {
						var image_size_width = (image_size == 'mini') ? env.images_mini_size : env.images_normal_size;
						var image_size_height = (image_size == 'mini') ? env.images_mini_size : env.images_normal_size;

						if (image_size == 'mini') {
							easyimg.thumbnail({
								src: image_url,
								dst: image_path,
								width: image_size_width,
								height: image_size_height,
								gravity: 'Center'
							}).then(function (image) {
								reply.file(image_path);
							}, function (err) {
								reply(json_error).code(404);
							});
						} else {
							easyimg.resize({
								src: image_url,
								dst: image_path,
								width: image_size_width,
								height: image_size_height
							}).then(function (image) {
								reply.file(image_path);
							}, function (err) {
								reply(json_error).code(404);
							});
						}
					}, function (err) {
						update_doc(resp._source, image_url);
						reply(json_error).code(404);
					});
				}
			} else {
				reply(json_error).code(404);
			}
		}, function (err) {
			reply(json_error).code(404);
		});
	},
	config: {
		tags: ['api'],
		description: 'Get a thumbnail for an image',
		notes: 'Returns the thumbnail',
		validate: {
			params: {
				species_id: Joi.string()
					.required()
					.min(1)
					.description('The species\' identifier (_id)'),

				image_size: Joi.string()
					.required()
					.valid('mini', 'normal')
					.description('The size of the thumbnail'),

				image_url: Joi.string()
					.required()
					.min(1)
					.description('URL of the original image file')
			}
		}
	}
};

var check_images = function (media, image) {
	for (var i = 0; i < media.length; i++) {
		if (media[i].identifier && media[i].identifier == image) {
			return true;
		}
	}
	return false;
}

var update_doc = function (doc, image) {
	var nano = require('nano')(env.couch_connexion_string);
	var db = nano.use(env.couch_db);

	var is_updated = false;

	for (var i = 0; i < doc.gbif_media.length; i++) {
		if (doc.gbif_media[i].identifier && doc.gbif_media[i].identifier == image) {
			doc.gbif_media.splice(i,1);
			is_updated = true;
		}
	}

	if (is_updated) {
		db.insert(doc, function (e, r) {
			;
		});
	}
}