function renderInfo(mep) {
  document.getElementById('mepphoto').style.backgroundImage = "none";
  document.getElementById('mepphoto').style.backgroundImage = "url(" + mep.photo || "http://www.europarl.europa.eu/mepphoto/undefined.jpg" + ")";
  document.getElementById('mepcountry').innerHTML = "<p>" + mep.country + "</p>";
  document.getElementById('mepparty').innerHTML = "<p>" + mep.party + "</p>";
  document.getElementById('mepgroup').innerHTML = "<p>" + mep.group + "</p>";
  document.getElementById('mepphone').innerHTML = "<p>" + mep.phone + "</p>";
};

function onLoad() {
  var meplist;

  var request = new XMLHttpRequest();
  request.open('GET', '/meps' + window.location.search, true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      meplist = JSON.parse(request.responseText);
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
    } else {
      console.error(JSON.stringify(error));
    }
  };

  request.onerror = function() {
    console.error(JSON.stringify(error));
  };

  request.send();

  /*$.get('/costs', function(data) {
      costs = data.price;
      leftPercentage = Math.floor(((20 - data.price) / 20) * 100);
      $('#costs').html(leftPercentage + " %");
      $('#costs').css('background', 'linear-gradient(#FFF ' + (100 - leftPercentage) + '%, green 0%, yellow 50%, red 100%)');
  }).fail(function(error) {
      console.error(JSON.stringify(error));
  });*/

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
