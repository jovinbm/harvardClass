$(document).ready(function () {
    var socket = io.connect('//' + window.location.hostname);


    //using bootstrap validator for form validation
    $("#studentLoginForm").bootstrapValidator();

    //js for logout from harvard ID
    function sendLogoutHarvardLogin() {
        $.ajax({
            url: "/logoutHarvardLogin",
            type: "POST",
            success: function () {
                //window.location = '//' + window.location.hostname;
                window.location = '//' + window.location.hostname + ':3000';
            }
        });
    }

    $('.logoutHarvardLogin').click(function () {
        sendLogoutHarvardLogin();
    });
});