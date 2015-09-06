var pulse = require('..').create(),
    options = {
        pulseApiKey: '',
        customerApiKey: ''
    };

function listenToEndpoints(item) {
    'use strict';
    pulse.on('endpoints:' + item, function endpoints(data) {
        console.dir(data);
    });
}

pulse.init(options);

pulse.endpoints(function done(data) {
    'use strict';
    data.forEach(listenToEndpoints);
});

pulse.on('error', function error(err) {
    'use strict';
    console.log(err.stack);
});
