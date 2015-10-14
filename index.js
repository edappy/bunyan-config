var extend = require('extend');

module.exports = convertConfig;

var streamConverters = {
    stdout: function () {
        return process.stdout;
    },

    stderr: function () {
        return process.stderr;
    },

    'bunyan-logstash': function (params) {
        return require('bunyan-logstash').createStream(params);
    },

    'bunyan-redis': function (params) {
        return new (require('bunyan-redis'))(params);
    }
};

/**
 * Converts jsonConfig into proper bunyan config. The original object is not modified.
 *
 * @param {Object} jsonConfig
 * @returns {Object} bunyanConfig
 */
function convertConfig(jsonConfig) {
    var bunyanConfig = extend({}, jsonConfig);

    if (Array.isArray(bunyanConfig.streams)) {
        bunyanConfig.streams = bunyanConfig.streams.map(convertStream);
    }

    return bunyanConfig;
}

function convertStream(stream) {
    var converter = streamConverters[getStreamName(stream)];

    return typeof converter === 'function' ? extend({}, stream, {
        stream: converter(getStreamParams(stream))
    }) : stream;
}

function getStreamName(stream) {
    if (!stream || !stream.stream) {
        return '';
    } else if (typeof stream.stream === 'string') {
        return stream.stream;
    } else if (typeof stream.stream.name === 'string') {
        return stream.stream.name;
    }
}

function getStreamParams(stream) {
    return stream && stream.stream && stream.stream.params;
}
