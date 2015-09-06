var pulse = require('..').create(),
    options = {
        pulseApiKey: '',
        customerApiKey: ''
    };

pulse.init(options);

pulse.on('pulses', function pulses(data) {
    'use strict';
    console.dir(data);
});

pulse.on('annotations', function annotations(data) {
    'use strict';
    console.dir(data);
});

pulse.on('error', function error(err) {
    'use strict';
    console.log(err.stack);
});
