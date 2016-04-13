var path = require('path');
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var twilio = require('twilio');
var config = require("../config");
var fs = require("fs"),
    json;

// Create a Twilio REST API client for authenticated requests to Twilio
var client = twilio(config.accountSid, config.authToken);

var calledMep = {};
var meps = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/assets/meps.json'), 'utf8')).meps;
var mepArray = [];
for (var i = 0; i < meps.length; i++) {
  mepArray.push({ "name": meps[i].Name.full, "phone": meps[i].Addresses[config.currentLocation].Phone,  "id": i });
}
mepArray.push(config.testCall);

// Configure application routes
module.exports = function(app) {
    // Set Jade as the default template engine
    app.set('view engine', 'jade');

    // Express static file middleware - serves up JS, CSS, and images from the
    // "public" directory where we started our webapp process
    app.use(express.static(path.join(process.cwd(), 'public')));

    // Parse incoming request bodies as form-encoded
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    // Use morgan for HTTP request logging
    app.use(morgan('combined'));

    // Home Page with Click to Call
    app.get('/', function(request, response) {
        response.render('index');
    });

    app.get('/meps', function(request, response) {
        response.writeHead(200, {
          'Content-Type': 'text/json'
        });
        response.end(JSON.stringify(mepArray));
    });

    // Handle an AJAX POST request to place an outbound call
    app.post('/call', function(request, response) {
        // This should be the publicly accessible URL for your application
        // Here, we just use the host for the application making the request,
        // but you can hard code it or use something different if need be
        var url = 'http://' + request.headers.host + '/outbound';
        calledMep = mepArray[request.body.mepId];

        // Place an outbound call to the user, using the TwiML instructions
        // from the /outbound route
        client.makeCall({
            to: request.body.phoneNumber,
            from: config.twilioNumber,
            url: url
        }, function(err, message) {
            console.log(err);
            if (err) {
                response.status(500).send(err);
            } else {
                response.send({
                    message: 'Thank you! We will be calling you shortly.'
                });
            }
        });
    });

    // Return TwiML instuctions for the outbound call
    app.post('/outbound', function(request, response) {
        // We could use twilio.TwimlResponse, but Jade works too - here's how
        // we would render a TwiML (XML) response using Jade
        var resp = new twilio.TwimlResponse();
        resp.say({voice: 'alice', language: 'de-DE'}, 'Hallo! Du wirst gleich mit ' + calledMep.name + ' verbunden.');
        resp.dial(calledMep.phone);

        response.writeHead(200, {
          'Content-Type': 'text/xml'
        });
        response.end(resp.toString());
    });
};
