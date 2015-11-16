var Stream = require('stream');
var path = require('path');
var gutil = require('gulp-util');
var BufferStreams = require('bufferstreams');
var fountain = require('fountain-js');

const PLUGIN_NAME = 'gulp-fountain';

// File level transform function
function fileFromFountain() {
	// return a callback function handling the buffered content
	return function(err, buf, callback) {
		// handle any error
		if (err) {
			throw err;
		}
		// Use the buffered content
		fountain.parse(String(buf), function(output) {
			// TODO: HANDLE ERRORS
			// // Report any error with the callback
			// if (err) {
			// 	callback(new gutil.PluginError(PLUGIN_NAME, err, {
			// 		showStack: true
			// 	}));
			// 	// Give the transformed buffer back
			// } else {
			// 	callback(null, output.script_html);
			// }

			callback(null, output.script_html);
		});
	};
}

// plugin function
function gulpFountain() {

	var stream = Stream.Transform({
		objectMode: true
	});

	stream._transform = function(file, unused, done) {
		// Do nothing when null
		if (file.isNull()) {
			stream.push(file);
			done();
			return;
		}

		// if the ext doesn't match, pass it through
		// TODO: SHOULD WE REALLY DO THIS?
		var ext = path.extname(file.path);
		if ('.fountain' !== ext) {
			stream.push(file);
			done();
			return;
		}

		file.path = gutil.replaceExtension(file.path, '.html');

		if (file.isBuffer()) {
			// BUFFERS
			fountain.parse(String(file.contents), function(output) {
				// TODO: HANDLE ERRORS
				// var err = null;
				// if (err) {
				// 	stream.emit('error',
				// 		new gutil.PluginError(PLUGIN_NAME, err, {
				// 			showStack: true
				// 		}));
				// 	return done();
				// }
				file.contents = Buffer(output.script_html);
				stream.push(file);
				done();
			});
		} else {
			// STREAMS
			file.contents = file.contents.pipe(new BufferStreams(fileFromFountain()));
			stream.push(file);
			done();
		}
	};

	return stream;

}

// export the file level transform function for other plugins usage
gulpFountain.fileTransform = fileFromFountain;

// export the plugin main function
module.exports = gulpFountain;
