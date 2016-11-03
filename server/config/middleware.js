var morgan      = require('morgan'), // used for logging incoming request
    bodyParser  = require('body-parser'),
    plugins     = require('../static/plugins/pluginTextContent.js')


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
      res.status(400).send("No query IP found!");
      return;
    }

    var jsFile = plugins.getActionEmitterText(req.query.serverip);
    res.set('Content-Type', 'application/javascript;charset=utf-8');
    res.send(jsFile);

  });

  app.get('/plugins/eventEmitter', function(req, res, next) {

    if (!req.query.serverip) {
      res.status(400).send("No query IP found!");
      return;
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
