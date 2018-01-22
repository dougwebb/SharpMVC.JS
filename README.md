# SharpMVC.JS
## Javascript Framework for ASP.Net MVC Core Projects

Every Javascript framework seems targeted to use cases where the server-side framework either doesn't exist or is a very basic data-access layer that returns JSON data responses. For ASP.Net MVC developers, this is *not* the case. 

* We have a fantastic server-side templating engine in Razor.
* We have a way to specify model validation rules using property attributes that are applied server-side during data binding when a form is submitted as well as client-side when the form is rendered using Razor's helpers.
* We have very flexible support for handling requests, and can easily do the data-lookup + JSON response thing.
* We're often working in Enterprise systems, where our data model classes and data-access layers are shared by other components in the system, including other GUIs. Having the validation rules specified on the model's 
properties allows them to express business rules that are obeyed across the system. You just can't do that with a client-side-only Javascript framework without duplicating logic.

SharpMVC.JS provides tools that make it easier to implement SPA-like pages in a typical ASP.Net MVC Core 2.0 application, without necessitating a completely foreign client-side application architecture. 
This is primarily accomplished by performing most DOM modifications server-side using Razor Partial templates, using a standard API for making the requests, a standard response format, and default behaviors
for managing the responses including error-handling.

## Hello World Example

In your container page markup include an element which will wrap dynamically-loaded content. Provide a way for Javascript to select the element, and a data attribute that specifies
the url of the AJAX request handler method. Typically you'll also want to render the Partial template that will be used for dynamic updates, so that your initial page load includes complete markup.

```html
<div class="panel-body" id="currentTime" data-href="@Url.Action("CurrentTime", "Home")">
     @Html.Partial("CurrentTime", DateTime.Now)
 </div>
```

In the Partial template, render the dynamic content.

```html
@model System.DateTime
<div>The time is @Model.ToString()</div>
```

After your initial page load, run some Javascript to set up and manage the dynamic updates. Typically that will involve event handlers to respond to user interactions, but in this
example Interval timer events are used. The `$.sm_ajax()` function is the workhorse here; it's a wrapper around `$.ajax()` that takes care of providing user feedback during the AJAX request
while the content is being updated, a variety of default (and overridable) behaviors for handling server-side errors and communication errors, and easy access to response data. In this 
example the response contains HTML markup that's used to update the DOM, but the API also supports a simple string response message and a structured JSON object.

```javascript
$(function () {
    "use strict";

    // Get the element that's going to be updated.
    var $currentTime = $("#currentTime"),
        url = $currentTime.data("href");

    // Set up an interval event to do the update every 5000ms
    setInterval(function () {

        // Call the server to get new markup for the element we're updating, and set 
        // the element's class to bg-warning during the ajax request.
        // Note that errors and responses without markup are handled automatically.
        $.sm_ajax(url, $currentTime, {
            loadingClass: "bg-warning",
            onSuccess: function (data) {
                $currentTime.html($(data.markup));
            }
        });

    }, 5000);
});
```

In your controller, define the AJAX request handler. This must be async and return a Task, because the view rendering service is async.

* `_viewRenderService` is provided by SharpMVC.JS, for rendering Partial Razor templates to a string. 
* `_actionContextAccessor` and `ViewData` are used to give the template access to the same contexts that it has when called from the initial page template.
* `SM_JsonResult` contains several helper methods that create and return `JsonResult` objects with a standard set of properties, which `$.sm_ajax()` knows how to interpret.


```csharp
public async Task<JsonResult> CurrentTime()
{
    // Define a model object to pass to the view. 
    var model = DateTime.Now;

    // Do a server-side rendering of the partial view, passing in the model. 
    var markup = await _viewRenderService.RenderToStringAsync("CurrentTime", model, _actionContextAccessor, ViewData);

    return SM_JsonResult.Success(markup: markup);
}
```

## State Management (aka: Where's the Data Binding?)



## TODO

* Document full rationale
* Full suite of example usage
* Setup NuGET packaging

