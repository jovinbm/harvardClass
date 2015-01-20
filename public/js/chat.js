/**
 * Created by jovinbm on 1/13/15.
 */
$(document).ready(function(){

    //using bootstrap validator for form validation
    $("#question_input").bootstrapValidator();

    $('.pull-down').each(function() {
        $(this).css('margin-top', $(this).parent().height()-$(this).height())
    });
});