// Execute JavaScript on page load
$(function() {
    $.get('/assets/meps.json', function(data) {
        for (var i = 0; i < data.meps.length; i++) {
          $('#meplist').append('<option value="' + data.meps[i].Addresses.Brussels.Phone + '">' + data.meps[i].Name.full + '</option>');
        }
    }).fail(function(error) {
        alert(JSON.stringify(error));
    });

    // Initialize phone number text input plugin
    $('#phoneNumber').intlTelInput({
        responsiveDropdown: true,
        autoFormat: true,
        utilsScript: '/vendor/intl-phone/libphonenumber/build/utils.js',
        initialCountry: "at",
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
                mepNumber: $('#mepList').val(),
                mepName: $('#mepList').html()
            }
        }).done(function(data) {
            // The JSON sent back from the server will contain a success message
            alert(data.message);
        }).fail(function(error) {
            alert(JSON.stringify(error));
        });
    });
});
