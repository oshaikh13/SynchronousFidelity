var morgan      = require('morgan'), // used for logging incoming request
    bodyParser  = require('body-parser'),
    plugins     = require('../static/plugins/pluginTextContent.js')


var publicIp = require('public-ip');
var internalIp = require('internal-ip');

var currentURL;

// publicIp.v4().then(ip => {
//   currentURL = "http://" + ip + ":" + process.env.PORT + "/";
//   console.log("SETTING UP ON: " + currentURL);
// });

var ip = internalIp.v4()
currentURL = "http://" + ip + ":" + process.env.PORT + "/";
console.log("SETTING UP ON: " + currentURL);

module.exports = function (app, express) {

  app.use(express.static('static/web'));

  // Express 4 allows us to use multiple routers with their own configurations
  var actionRouter = express.Router();
  var eventRouter = express.Router();
  var compareRouter = express.Router();

  // app.use(morgan('dev'));
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());

  app.use('/api/action', actionRouter);
  app.use('/api/event', eventRouter);
  app.use('/api/compare', compareRouter);

  app.get('/plugins/actionEmitter', function(req, res, next) {

    if (!req.query.serverip) {
      req.query.serverip = currentURL;
    }

    var jsFile = plugins.getActionEmitterText(req.query.serverip);
    res.set('Content-Type', 'application/javascript;charset=utf-8');
    res.send(jsFile);

  });

  app.get('/plugins/eventEmitter', function(req, res, next) {

    if (!req.query.serverip) {
      req.query.serverip = currentURL;
    }

    var jsFile = plugins.getEventEmitterText(req.query.serverip);
    res.set('Content-Type', 'application/javascript;charset=utf-8');
    res.send(jsFile);

  });

  // inject our routers into their respective route files
  require('../actions/actionRoutes.js')(actionRouter);
  require('../events/eventRoutes.js')(eventRouter);
  require('../compare/compareRoutes.js')(compareRouter);


};
