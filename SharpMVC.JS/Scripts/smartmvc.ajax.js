// smartmvc.ajax.js

// Wrapper for $.ajax with built-in error handling and support for responses creating using SM_JsonResult methods.
//
// Arguments:
// - url: The url to send the request too
// - $feedbackElement: a jQuery object pointing to an element which will have a "loading" class applied during the request. (Optional)
// - options: an object containing callback functions and other options
// 
// Options (Commonly used):
// - type: HTTP Method; defaults to GET
// - data: data to upload; typically either $("form").serialize() or new FormData($("form")[0])
// - cache: set to true to append _{timestamp} to GET/HEAD requests to prevent cached responses
// - onSuccess(data): function called when request is successful. data is the json object created by SM_JsonResult.
// - onProgress(loaded, total, e): function called with upload/download progress events. loaded and total will be set
//      to -1 if the browser can't compute the data transfer size. Won't be called for browsers that don't support XHR2.
// - processData: set to false when uploading files using FormData()
// - contentType: set to false when uploading files using FormData(). (Don't try to use multipart encoding type.)
//
// Options (rarely used): 
// - dataType: response type; defaults to "json"
// - loadingClass: defaults to "loading"; can be changed to a different class name
// - onSessionError(jqXHR, textStatus, errorThrown): called when session expired
//      - default: reload page to get redirected to login page
// - onAjaxCancelled(jqXHR, textStatus, errorThrown): called when user/browser cancels ajax request
//      - default: ignore error
// - onAjaxError(jqXHR, textStatus, errorThrown): called when there is an http error
//      - default: show alert box with textStatus and errorThrown
// - onErrorResponse(data, textStatus, jqXHR): called when data.resultCode != "OK"
//      - default: show alert box with data.message
// - onMessageOnlyResponse(data, textStatus, jqXHR): called when data.resultCode == "OK", data.message has a value, and data.markup doesn't
//      - default: show alert box with data.message
// - beforeSend(jqXHR, ajaxSettings): sets up class on $feedbackElement
// - complete(jqXHR, textStatus): cleans up class on $feedbackElement
(function ($) {
    "use strict";

    $.extend({
        sm_ajax: function (url, $feedbackElement, options) {
            var opts = $.extend({
                loadingClass: "loading",
                onSuccess: function (data) {
                },
                onProgerss: null,
                onSessionError: function (jqXHR, textStatus, errorThrown) {
                    // Reload the page to get the redirect again as a page refresh
                    window.location.reload();
                },
                onAjaxCancelled: function (jqXHR, textStatus, errorThrown) {
                    // Ignore the error
                },
                onAjaxError: function (jqXHR, textStatus, errorThrown) {
                    alert(textStatus + ": " + errorThrown);
                },
                onErrorResponse: function (data, textStatus, jqXHR) {
                    alert(data.message);
                },
                onMessageOnlyResponse: function (data, textStatus, jqXHR) {
                    alert(data.message);
                },
                beforeSend: function (jqXHR, ajaxSettings) {
                    if ($feedbackElement != undefined)
                        $feedbackElement.addClass(opts.loadingClass);
                },
                complete: function (jqXHR, textStatus) {
                    if ($feedbackElement != undefined)
                        $feedbackElement.removeClass(opts.loadingClass);
                },

                type: "GET",
                dataType: "json",
                cache: false,
                processData: true,
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                async: true,
                data: {}

            }, options || {});

            $.ajax({
                url: url,
                data: opts.data,
                type: opts.type,
                dataType: opts.dataType,
                cache: opts.cache,
                processData: opts.processData,
                contentType: opts.contentType,
                async: opts.async,
                xhr: function () {
                    var myXhr = $.ajaxSettings.xhr();
                    if (opts.onProgress != null && myXhr.upload) {
                        myXhr.upload.addEventListener('progress', function (e) {
                            if (e.lengthComputable)
                                opts.onProgress(e.loaded, e.total, e);
                            else
                                opts.onProgress(-1, -1, e);
                        }, false);
                    }
                    return myXhr;
                },
                beforeSend: function (jqXHR, ajaxSettings) {
                    opts.beforeSend(jqXHR, ajaxSettings);
                },
                complete: function (jqXHR, textStatus) {
                    opts.complete(jqXHR, textStatus);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    // Check for requests cancelled by user action
                    if (jqXHR.readyState < 4) {
                        opts.onAjaxCancelled(jqXHR, textStatus, errorThrown);
                        return;
                    }

                    // Check if the response was an authentication redirect to the Login page
                    var contentType = jqXHR.getResponseHeader('Content-Type');
                    if (jqXHR.status == 200 && typeof contentType == 'string' && contentType.toLowerCase().indexOf('text/html') >= 0) {
                        opts.onSessionError(jqXHR, textStatus, errorThrown);
                        return;
                    }
                    else {
                        opts.onAjaxError(jqXHR, textStatus, errorThrown);
                        return;
                    }
                },
                success: function (data, textStatus, jqXHR) {
                    if (data.resultCode != "OK") {
                        opts.onErrorResponse(data, textStatus, jqXHR);
                    }
                    else if (data.message.length > 0 && (data.markup == null || data.markup == "")) {
                        opts.onMessageOnlyResponse(data, textStatus, jqXHR);
                    }
                    else {
                        opts.onSuccess(data);
                    }
                }
            });
        }
    });
})(jQuery);
