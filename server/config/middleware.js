var morgan      = require('morgan'), // used for logging incoming request
    bodyParser  = require('body-parser')


module.exports = function (app, express) {

  // Simple activity checker
  app.get('/active', function (req, res) {
    res.send("Hi.")
  })

  // Express 4 allows us to use multiple routers with their own configurations
  var actionRouter = express.Router();

  app.use(morgan('dev'));
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());

  app.use('/api/action', actionRouter); // use user router for all user request

  // inject our routers into their respective route files
  require('../actions/actionRoutes.js')(actionRouter);


};
