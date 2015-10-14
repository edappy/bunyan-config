# bunyan-config

This module converts JSON configuration into a proper bunyan configuration object.

It is useful when you want/need to restrict your configuration to a JSON object, 
where you cannot reference `process.stdout` or instantiate plugins.

# Installation

npm install bunyan-config --save

# Usage

```
var jsonConfig = {
    name: 'myLogger',
    streams: [{
        stream: 'stdout' // shorthand config
    }, {
        stream: { name: 'stderr' } // full version
    }, {
        type: 'raw',
        stream: { // full version with params
            name: 'bunyan-logstash',
            // The value of `streamParams` is stream-specific.
            params: {
                host: 'localhost',
                port: 5005
            }
        }
    }, {
        type: 'raw',
        stream: {
            name: 'bunyan-redis',
            params: {
                host: 'localhost',
                port: 6379
            }
        }
    }
]};

var bunyanConfig = require('bunyan-config')(jsonConfig);

var logger = require('bunyan').createLogger(bunyanConfig); 
```

# Supported streams

- stdout
- stderr
- bunyan-logstash
- bunyan-redis

Please submit pull requests with support for additional streams.
