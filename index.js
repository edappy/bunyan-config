var extend = require('extend');
var path = require('path');
var objectPath = require('object-path');

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

    if (bunyanConfig.serializers) {
        bunyanConfig.serializers = convertSerializers(bunyanConfig.serializers);
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

function convertSerializers(serializers) {
    if (typeof serializers === 'string') {
        return convertSerializer(serializers);

    } else if (typeof serializers === 'object' && serializers !== null) {
        var convertedSerializers = {};
        for (var key in serializers) {
            convertedSerializers[key] = convertSerializer(serializers[key]);
        }
        return convertedSerializers;
    } else {
        return serializers;
    }
}

function convertSerializer(serializer) {
    if (typeof serializer !== 'string' || serializer === '') {
        return serializer;
    }

    var serializerParts = serializer.split(':');
    if (serializerParts.length > 2 || serializerParts[0] === '') {
        return serializer;
    }

    var serializerModuleId = serializerParts[0][0] === '.' ? path.resolve(serializerParts[0]) : serializerParts[0];
    var serializerModule = require(serializerModuleId);

    var serializerProperty = serializerParts[1] || '';
    if (serializerProperty) {
        return objectPath.get(serializerModule, serializerProperty);
    } else {
        return serializerModule;
    }
}
