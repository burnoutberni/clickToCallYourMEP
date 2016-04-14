# Click to Call Your MEP

Little calling helper for online campaigns targeted at MEPs inspired by [PiPhone](http://piphone.lqdn.fr/) and based on [clicktocall-node](https://github.com/TwilioDevEd/clicktocall-node)

## Installation

    npm install

Declare the following environment variables:

    export TWILIO_ACCOUNT_SID=enter_your_account_sid_here
    export TWILIO_AUTH_TOKEN=enter_your_auth_token_here
    export TWILIO_NUMBER=+1234567890
    export CURRENT_LOCATION=Brussels  # alternatively Strasbourg

## Usage

    node app.js

This starts a local webserver on port 3000.

### ```/``` – boilerplate site
At ```localhost:3000``` you find a boilerplate calling campaign site where you can choose an MEP (Member of the European Parliament) of your choice, enter your phone number and you will receive a call and get connected to the MEP via Twilio. You can use GET parameters for filtering.

### ```/meps``` – MEP JSON API
JSON array of all MEPs with their full name, phone number (see Installation on how to change the number from/to Brussels/Strasbourg), country, full party name and the short form of their political group as well as an integer id. You can use this id with ```/call```. You can use GET parameters for filtering.

### ```/mep``` – Single random MEP
JSON object of only one MEP (for the attributes see ```/meps```). You can use GET parameters for filtering.

### ```/call``` – Call API
Post the following attributes to start a call:

    phoneNumber: +1234567890
    mepId: 42

### ```?foo=bar``` – Filter MEPs
The following filters can be used and freely combined:

    ?country=Finland
    ?group=GUE%2FNGL
    ?party=%C3%96sterreichische%20Volkspartei

## Licensing

* The original code from Twilio is licensed under the MIT License (MIT) Copyright (c) 2014 Twilio, Inc. (see LICENSE_twilio).
* All rest of the code is licensed under the GNU AFFERO GENERAL PUBLIC LICENSE, Version 3 (AGPL-3.0) by Bernhard Hayden (see LICENSE).
* The data source is licensed under the [Open Data Commons Open Database License (ODbL)](http://opendatacommons.org/licenses/odbl/) by [Parltrack](http://parltrack.euwiki.org/).
