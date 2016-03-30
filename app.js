(function () {
  process.title = 'chernika';

  GLOBAL["config"] = require('./config.local');
  GLOBAL['logger'] = require('./utils/logger').create();

  var model = require('./api/model');
  var api = require('./api/api');

  model.init();
  api.init();
})();