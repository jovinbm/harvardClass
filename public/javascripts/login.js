$(document).ready(function () {
    var socket = io.connect(window.location.hostname);


    //using bootstrap validator for form validation
    //$(form).bootstrapValidator({
    //    excluded: [':disabled', ':hidden', ':not(:visible)'],
    //    feedbackIcons: {
    //        valid: 'glyphicon glyphicon-ok',
    //        invalid: 'glyphicon glyphicon-remove',
    //        validating: 'glyphicon glyphicon-refresh'
    //    },
    //    live: 'enabled',
    //    message: 'This value is not valid',
    //    submitButtons: 'button[type="submit"]',
    //    trigger: null,
    //    fields: {
    //        customUsername: {
    //            validators: {
    //                notEmpty: {
    //                    enabled: true
    //                },
    //                stringLength: {
    //                    min: 4,
    //                    max: 10,
    //                    message: 'The username must at least 4 and at most 10 characters long'
    //                },
    //                regexp: {
    //                    regexp: /^[a-zA-Z0-9_]+$/,
    //                    message: 'The username can only consist of alphabetical, number and underscore'
    //                }
    //            }
    //        },
    //        classCode: {
    //            validators: {
    //                notEmpty: {
    //                    enabled: true
    //                },
    //                stringLength: {
    //                    min: 4,
    //                    max: 10,
    //                    message: 'The class code must at least 4 and at most 10 characters long'
    //                },
    //                regexp: {
    //                    regexp: /^[a-zA-Z0-9_]+$/,
    //                    message: 'The username can only consist of alphabetical, number and underscore'
    //                }
    //            }
    //        }
    //    }
    //});
});