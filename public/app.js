function renderInfo(mep) {
  $('#mepphoto').attr("src", mep.photo || "http://www.europarl.europa.eu/mepphoto/undefined.jpg");
  $('#mepname').html("<h2>" + mep.name + "</h2>");
  $('#mepcountry').html("<p>" + mep.country + "</p>");
  $('#mepparty').html("<p>" + mep.party + "</p>");
  $('#mepgroup').html("<p>" + mep.group + "</p>");
  $('#mepphone').html("<p>" + mep.phone + "</p>");
};

$(function() {
    var meplist;
    $.get('/meps' + window.location.search, function(data) {
        meplist = data;
        for (var i = 0; i < data.length; i++) {
          $('#meplist').append('<option value="' + meplist[i].id + '">' + meplist[i].name + '</option>');
        }
        renderInfo($.grep(meplist, function(e){ return e.id == $('#meplist').val()})[0]);
    }).fail(function(error) {
        alert(JSON.stringify(error));
    });

    // Initialize phone number text input plugin
    $('#phoneNumber').intlTelInput({
        responsiveDropdown: true,
        autoFormat: true,
        utilsScript: '/vendor/intl-phone/libphonenumber/build/utils.js',
        onlyCountries: ["at", "be", "bg", "hr", "cz", "dk", "ee", "fi", "fr",
        "de", "gr", "hu", "ie", "it", "lv", "lt", "mt", "nl", "pl", "pt", "ro",
        "sk", "si", "es", "se", "gb"]
    });

    $('#meplist').on('change', function(e) {
        var selectedMepId = $(this).val();
        renderInfo($.grep(meplist, function(e){ return e.id == selectedMepId })[0]);
    });

    // Intercept form submission and submit the form with ajax
    $('#contactForm').on('submit', function(e) {
        // Prevent submit event from bubbling and automatically submitting the
        // form
        e.preventDefault();

        // Call our ajax endpoint on the server to initialize the phone call
        $.ajax({
            url: '/call',
            method: 'POST',
            dataType: 'json',
            data: {
                phoneNumber: $('#phoneNumber').val(),
                mepId: $('#meplist').val()
            }
        }).done(function(data) {
            // The JSON sent back from the server will contain a success message
            alert(data.message);
        }).fail(function(error) {
            alert(JSON.stringify(error));
        });
    });
});
