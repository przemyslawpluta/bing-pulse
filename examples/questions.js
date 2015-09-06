var pulse = require('..').create(),
    options = {pulseApiKey: ''};

pulse.init(options);

pulse.on('questions', function questions(data) {
    'use strict';
    console.dir(data);
});

pulse.on('error', function error(err) {
    'use strict';
    console.log(err.stack);
});
