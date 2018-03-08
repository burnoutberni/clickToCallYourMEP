var path = require('path');
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var twilio = require('twilio');
var config = require("../config");
var fs = require("fs"),
    json;

String.prototype.capitalizeFirstLetters = function() {
    return this.replace(/(^|[^a-zA-Z\u00C0-\u017F'])([a-zA-Z\u00C0-\u017F])/g, function (m) {
      return m.toUpperCase()
    });
}

// Create a Twilio REST API client for authenticated requests to Twilio
var client = twilio(config.accountSid, config.authToken);

var calledMep = {};
var meps = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/assets/meps.json'), 'utf8')).meps;
var mepArray = [];
if (config.testCall) { mepArray.push(config.testCall); }

meps.map((mep) => {
  let mepCommittees = []
  mep.Committees.map((committee) => {
    const start = new Date(committee.start)
    const end = new Date(committee.end)
    const now = new Date()

    if (start < now && end > now) {
      committee.abbr === null
        ? mepCommittees.push(committee.Organization)
        : mepCommittees.push(committee.abbr)
    }
  })
  mepArray.push({ "name": mep.Name.sur + " " + mep.Name.familylc.capitalizeFirstLetters(),
                "phone": mep.Addresses[config.currentLocation].Phone,
                "id": mepArray.length,
                "country": mep.Constituencies[0].country,
                "party": mep.Constituencies[0].party,
                "group": mep.Groups[0].groupid,
                "photo": mep.Photo,
                "committees": mepCommittees});
})

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

    app.get('/iframe', function(request, response) {
        response.render('mepbox');
    });

    app.get('/mep', function(request, response) {
        var filteredMepArray = mepArray.slice();

        if (request.query.country) { var country = request.query.country; }
        if (request.query.group) { var group = request.query.group; }
        if (request.query.party) { var party = request.query.party; }
        if (request.query.committee) { var committee = request.query.committee; }

        for (var i = filteredMepArray.length - 1; i >= 0; i--) {
            var filteredMep = filteredMepArray[i];
            if ((country && encodeURIComponent(filteredMep.country.toLowerCase()) !== encodeURIComponent(country.toLowerCase())) ||
                (group && encodeURIComponent(filteredMep.group.toLowerCase()) !== encodeURIComponent(group.toLowerCase())) ||
                (party && encodeURIComponent(filteredMep.party.toLowerCase()) !== encodeURIComponent(party.toLowerCase())) ||
                (committee && encodeURIComponent(filteredMep.committees.join(',').toLowerCase()).search(encodeURIComponent(committee.toLowerCase())))
                ) {
                filteredMepArray.splice(i, 1);
            }
        }
        response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        response.end(JSON.stringify(filteredMepArray[Math.floor(Math.random()*filteredMepArray.length)]));
    });

    app.get('/meps', function(request, response) {
        var filteredMepArray = mepArray.slice();

        if (request.query.country) { var country = request.query.country; }
        if (request.query.group) { var group = request.query.group; }
        if (request.query.party) { var party = request.query.party; }
        if (request.query.committee) { var committee = request.query.committee; }

        for (var i = filteredMepArray.length - 1; i >= 0; i--) {
            var filteredMep = filteredMepArray[i];
            if ((country && encodeURIComponent(filteredMep.country.toLowerCase()) !== encodeURIComponent(country.toLowerCase())) ||
                (group && encodeURIComponent(filteredMep.group.toLowerCase()) !== encodeURIComponent(group.toLowerCase())) ||
                (party && encodeURIComponent(filteredMep.party.toLowerCase()) !== encodeURIComponent(party.toLowerCase())) ||
                (committee && encodeURIComponent(filteredMep.committees.join(',').toLowerCase()).search(encodeURIComponent(committee.toLowerCase())))
                ) {
                filteredMepArray.splice(i, 1);
            }
        }

        response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        response.end(JSON.stringify(filteredMepArray));
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
        resp.say({voice: 'alice', language: 'en-UK'}, 'Hello, you will now be connected with the office of MEP ' + calledMep.name + '.');
        resp.dial(calledMep.phone);

        response.writeHead(200, {
          'Content-Type': 'text/xml'
        });
        response.end(resp.toString());
    });
};
