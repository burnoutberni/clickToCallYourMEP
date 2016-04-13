// Execute JavaScript on page load
$(function() {
    $.get('/meps', function(data) {
        for (var i = 0; i < data.length; i++) {
          $('#meplist').append('<option value="' + data[i].id + '">' + data[i].name + '</option>');
        }
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
