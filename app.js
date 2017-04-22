(function () {
  console.log("start");
  
  process.title = 'chernika';

  console.log("before require config.local");
  
  var configurationExports = require('./config.local');
  
  console.log(JSON.stringify(configurationExports));
  
  GLOBAL["config"] = configurationExports.config;
  
  console.log(JSON.stringify(GLOBAL["config"]));
  
  console.log("before require ./utils/logger");
  
  GLOBAL['logger'] = require('./utils/logger').create();
  
  console.log("before require ./api/model and ./api/api");
  
  var model = require('./api/model');
  var api = require('./api/api');

  console.log("before model init");
  
  model.init();
  
  console.log("before app init");
  
  api.init();
  
  console.log("end");
})();
