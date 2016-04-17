function renderInfo(mep) {
  document.getElementById('mepphoto').style.backgroundImage = "none";
  document.getElementById('mepphoto').style.backgroundImage = "url(" + mep.photo || "http://www.europarl.europa.eu/mepphoto/undefined.jpg" + ")";
  document.getElementById('mepcountry').innerHTML = "<p>" + mep.country + "</p>";
  document.getElementById('mepparty').innerHTML = "<p>" + mep.party + "</p>";
  document.getElementById('mepgroup').innerHTML = "<p>" + mep.group + "</p>";
  document.getElementById('mepphone').innerHTML = "<p>" + mep.phone + "</p>";
};

function get(url, success) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      success(request.responseText);
    } else {
      console.error(JSON.stringify(error));
    }
  };
  request.onerror = function() {
    console.error(JSON.stringify(error));
  };
  request.send();
}

function onLoad() {
  var meplist;
  get('/meps' + window.location.search, function(data) {
    meplist = JSON.parse(data);
    meplist.forEach(function(mep) {
      var newMepItem = document.createElement('option');
      newMepItem.innerHTML = mep.name;
      newMepItem.setAttribute('value', mep.id);
      document.getElementById('meplist').appendChild(newMepItem);
    });
    if (window.location.search.toLowerCase().search("random") !== -1) {
      document.getElementById('meplist').querySelector('option:nth-child(' + Math.floor(Math.random()*meplist.length) + ')').setAttribute("selected", "selected");
    }
    renderInfo(meplist.filter(function(e) { return e.id == document.getElementById('meplist').value })[0]);
  });

  document.getElementById('phoneNumber').onfocus = function() {
    if (this.value === '') {
      this.setAttribute('value', '+');
    }
  }

  document.getElementById('meplist').onchange = function(e) {
    var selectedMepId = this.value;
    renderInfo(meplist.filter(function(e) { return e.id == selectedMepId })[0]);
  }

  document.getElementById('contactForm').onsubmit = function(e) {
    e.preventDefault();
    var request = new XMLHttpRequest();
    request.open('POST', '/call', true);
    request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    request.send({
      phoneNumber: document.getElementById('phoneNumber').value,
      mepId: document.getElementById.value
    });
  };
};

function ready(fn) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
};

ready(onLoad);
