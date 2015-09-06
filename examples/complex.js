var pulse = require('..').create(),
    options = {
        interval: 5,
        inactive: 'neutral',
        pulseApiKey: '',
        customerApiKey: ''
    };

pulse.init(options);

pulse.on('questions', function questions(data) {
    'use strict';
    console.dir(data);
});

pulse.on('pulses', function pulses(data) {
    'use strict';
    console.dir(data);
});

pulse.on('annotations', function annotations(data) {
    'use strict';
    console.dir(data);
});

pulse.on('stats', function stats(data) {
    'use strict';
    console.dir(data);
});

pulse.on('error', function error(err) {
    'use strict';
    console.log(err.stack);
});
