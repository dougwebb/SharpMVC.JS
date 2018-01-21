$(function () {
    "use strict";

    // Get the element that's going to be updated.
    var $currentTime = $("#currentTime"),
        url = $currentTime.data("href");

    // Set up an interval event to do the update every 5000ms
    setInterval(function () {

        // Call the server to get new markup for the element we're updating. Set the element's class to bg-warning during the ajax request.
        // Note that errors and responses without markup are handled automatically.
        $.sm_ajax(url, $currentTime, {
            loadingClass: "bg-warning",
            onSuccess: function (data) {
                $currentTime.html($(data.markup));
            }
        });

    }, 5000);
});

