var bunyanConfig = require('../index');

describe('bunyan-config', function () {
    it('should not convert things it does not understand', function () {
        bunyanConfig({
            streams: [{
                path: '/tmp/log.log'
            }, {
                type: 'raw',
                stream: 'unknown'
            }]
        }).should.deep.equal({
                streams: [{
                    path: '/tmp/log.log'
                }, {
                    type: 'raw',
                    stream: 'unknown'
                }]
            });
    });

    it('should convert stdout and stderr', function () {
        bunyanConfig({
            streams: [{
                level: 'info',
                stream: 'stdout'
            }, {
                stream: {name: 'stderr'}
            }]
        }).should.deep.equal({
                streams: [{
                    level: 'info',
                    stream: process.stdout
                }, {
                    stream: process.stderr
                }]
            });
    });

    it('should convert bunyan-logstash', function () {
        bunyanConfig({
            streams: [{
                level: 'error',
                type: 'raw',
                stream: {
                    name: 'bunyan-logstash',
                    params: {
                        host: 'example.com',
                        port: 1234
                    }
                }
            }]
        }).should.deep.equal({
                streams: [{
                    level: 'error',
                    type: 'raw',
                    stream: require('bunyan-logstash').createStream({
                        host: 'example.com',
                        port: 1234
                    })
                }]
            });
    });

    it('should convert bunyan-redis stream', function () {
        var config = bunyanConfig({
            streams: [{
                type: 'raw',
                stream: {
                    name: 'bunyan-redis',
                    params: {
                        host: 'example.com',
                        port: 1234
                    }
                }
            }]
        });

        config.streams[0].stream.should.be.an.instanceof(require('events').EventEmitter);
        config.streams[0].stream._client.host.should.equal('example.com');
        config.streams[0].stream._client.port.should.equal(1234);
    });
});
