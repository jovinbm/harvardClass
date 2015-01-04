$(document).ready(function () {
    var socket = io.connect('//' + window.location.hostname);

    /*the redirect url for logout
     the logout URL for temp production and development purposes(uncomment one)*/
    var logoutURL = "//window.location = '//' + window.location.hostname";
    //var logoutURL = "window.location = '//' + window.location.hostname + ':3000'";



    //using bootstrap validator for form validation
    $("#studentLoginForm").bootstrapValidator();

    //js for logout from harvard ID
    function sendLogoutHarvardLogin() {
        $.ajax({
            url: "/logoutHarvardLogin",
            type: "POST",
            success: function () {
                window.location = logoutURL;
            }
        });
    }

    $('.logoutHarvardLogin').click(function () {
        sendLogoutHarvardLogin();
    });
});