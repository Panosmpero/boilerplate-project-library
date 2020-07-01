'use strict';

const express     = require('express');
const bodyParser  = require('body-parser');
const cors        = require('cors');
const helmet      = require("helmet");
const noCache     = require("nocache");
const dotenv      = require("dotenv").config();
const mongoose    = require("mongoose");

const apiRoutes         = require('./routes/api.js');
const fccTestingRoutes  = require('./routes/fcctesting.js');
const runner            = require('./test-runner');

mongoose.connect(process.env.MONGOOSE_URI, { 
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
   }, (error) => {
  if (error) console.log("Failed to connect to DB: " + error);
  console.log("Connected to DB.")
});

const app = express();

app.use(noCache());
app.use(helmet.hidePoweredBy({ setTo: "PHP 4.2.0" }));

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //USED FOR FCC TESTING PURPOSES ONLY!

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);  
    
//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port " + process.env.PORT);
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        const error = e;
          console.log('Tests are not valid:');
          console.log(error);
      }
    }, 1500);
  }
});

module.exports = app; //for unit/functional testing
