/**
 * Created by jovinbm on 1/13/15.
 */
$(document).ready(function(){
    $('.pull-down').each(function() {
        $(this).css('margin-top', $(this).parent().height()-$(this).height())
    });
});