$(document).ready(function () {
    var socket = io.connect(window.location.hostname);


    //using bootstrap validator for form validation
    $("#studentLoginForm").bootstrapValidator();
});