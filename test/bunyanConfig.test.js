var bunyanConfig = require('../index');
var bunyan = require('bunyan');
var path = require('path');

describe('bunyan-config', function () {
    it('should not convert things it does not understand', function () {
        bunyanConfig({
            name: 'test',
            streams: [{
                path: '/tmp/log.log'
            }, {
                type: 'raw',
                stream: 'unknown'
            }],
            serializers: 5
        }).should.deep.equal({
                name: 'test',
                streams: [{
                    path: '/tmp/log.log'
                }, {
                    type: 'raw',
                    stream: 'unknown'
                }],
                serializers: 5
            });
    });

    describe('streams', function () {
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
            config.streams[0].stream._client.end();
        });
    });

    describe('serializers', function () {
        it('should convert serializers property, if it is a string', function () {
            bunyanConfig({
                serializers: 'bunyan:stdSerializers'
            }).should.deep.equal({
                    serializers: bunyan.stdSerializers
                });
        });

        it('should not convert serializers, if it is an empty string', function () {
            bunyanConfig({
                serializers: ''
            }).should.deep.equal({
                    serializers: ''
                });
        });

        it('should convert serializers object', function () {
            var absolutePathWithProps = path.resolve(__dirname, './fixtures/dummySerializerWithProps');
            var relativePathWithProps = './' + path.relative(process.cwd(), absolutePathWithProps);

            var absolutePathWithoutProps = path.resolve(__dirname, './fixtures/dummySerializerWithoutProps');
            var relativePathWithoutProps = './' + path.relative(process.cwd(), absolutePathWithoutProps);

            bunyanConfig({
                serializers: {
                    moduleWithProps: 'bunyan:stdSerializers.req',
                    moduleWithoutProps: 'bunyan',
                    absoluteWithProps: relativePathWithProps + ':c',
                    relativeWithProps: relativePathWithProps + ':a.b',
                    absoluteWithoutProps: absolutePathWithoutProps,
                    relativeWithoutProps: relativePathWithoutProps,
                    empty: '',
                    noModuleId: ':abc'
                }
            }).should.deep.equal({
                    serializers: {
                        moduleWithProps: bunyan.stdSerializers.req,
                        moduleWithoutProps: bunyan,
                        absoluteWithProps: require('./fixtures/dummySerializerWithProps').c,
                        relativeWithProps: require('./fixtures/dummySerializerWithProps').a.b,
                        absoluteWithoutProps: require('./fixtures/dummySerializerWithoutProps'),
                        relativeWithoutProps: require('./fixtures/dummySerializerWithoutProps'),
                        empty: '',
                        noModuleId: ':abc'
                    }
                });
        });
    });
});
