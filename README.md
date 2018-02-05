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

This is not a toolset for producing a full SPA design; rather it's for a Hybrid-SPA design, where pages are loaded in a traditional manner but contain interactive elements that load additional content. You're not going to develop a game this way, but you can compress a traditional "Load form, validate, submit, server-side validate, resubmit, show result" set of pages into a single page load and AJAX-based interaction with the server.

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

If you're familiar with Javascript Frameworks like Angular, React, or Vue, you probably looked at the Hello World example and thought "This isn't the same kind of thing at all."
You're right, it isn't, and that's intentional. In my experience, those sorts of frameworks don't work very well with the ASP.Net MVC server-side framework, because there is no
integration or coordination between MVC's server-side and the client-side. 

I've found that there are three kinds of state that need to be managed:

### Pure Client-side State

Sometimes the GUI needs to respond to a user event, but responding does not require any information from the server, and the server does not need to be informed of the event or response.

Some examples of this are opening and closing expandable content areas, or switching between tabbed content panes, where all of the content is pre-loaded. Filling in forms is often like this
as well, because the server doesn't get involved until the form is submitted, but selections might enable/disable other form controls.

*Usually*, these kinds of interactions are easily handled using a GUI toolkit like Bootstrap, or by attaching Javascript event handler functions to the necessary events. You do need to
beware of complexity in the number or nature of the events and responses, especially if responses can cause cascading events. In those cases you should make use of React or Vue and data-binding
your state information to Javascript objects to make it more managable.

Client-side form validation is a special case. For ASP.Net MVC, [form validation rules](https://docs.microsoft.com/en-us/aspnet/core/mvc/models/validation) are specified on the Model class 
properties and Razor renders `data-` attributes on the form elements to describe the validation rules and messages. Then `jquery.validate` and `jquery.validation.unobtrusive` are used to pick
up on those `data-` attributes and use them to perform client-side validation. You *don't* want another framework getting in the way of this behavior, which is one reason server-side rendering
is so important in ASP.Net MVC projects.

### Semi Client-side State

Here, the server doesn't really care about what's going on with the client-side state, but the client needs to get additional information from the server in order to respond to a user event.

Examples include expandable content areas or tab panes where the content is not pre-loaded, forms that include selection lists whose options depend on other control values but there are too many
options overall to pre-load them, and most kinds of paged content (search results, comments forum, etc) where the user's current position in the results is not needed server-side except for when
the next page is requested.

In these cases, the client must send an AJAX request to the server with all of the parameters needed to get the necessary data. The common frameworks expect a JSON string in response, which the
framework deserialzes into state data and uses it to update the DOM. With SmartMVC.JS that's still possible by returning a Model object, but typically the Model object is passed to a Partial View,
and the markup from the view is returned in the AJAX response. Then it's a simple matter to update the DOM atomically by replacing the innerHTML of an element with the new markup. That container 
element will normally carry `data-` attributes that identify the AJAX handler's url and any additional information needed to manage the element, and will also usually be the attachment point for
event handlers to catch events as they bubble up, so that the event handlers don't need to be reattached when the DOM is updated.

As noted above, if the DOM update includes form controls and you're using form validation, then you really want to render the updated form controls server-side in a Razor Partial template.

### Server-side State

This is where the client has to tell the server about the user interaction, because the server must make an update to server-side state, such as updating a database.

The most obvious example is submitting a form, but it many apps just manipulating a control will cause an immediate server-side state change. Again, an AJAX request must be sent with
parameters that specify the new state. For a form submission jQuery's `$("#formid").serialize()` can be used to serialize the data, which can be passed to `$.sm_ajax()` as a `data` property
in its third argument. (The third argument is mostly the same as the options argument for `$.ajax`.) If you're not using a form, a Javascript array of `{ name: "paramName", value: "paramValue" }`
can be passed as the `data` property. 

On the server-side, the parameters are handled by ASP.Net MVC. They're available as string name/value pairs in `Request.Params[...]`, and they can also be data-bound to arguments in the 
handler method. You can have a separate argument for each parameter, and do automatic type conversions for non-strings, or you can have one of your Model classes as the argument and MVC will
data-bind to the class properties. This is especially useful for form submissions, because you use the same Model that you used to render the form; the parameter names will map directly to the 
Model property names (including nested object properties and indexed collections), and the form validation attributes will be tested during data-binding to initialize a `ModelState` object.
The `ModelState` object tells you if the validation passed, and if it didn't you can re-render the form using the same Model object and have the validation error messages shown immediately. 

## TODO

* Document full rationale
* Full suite of example usage
* Setup NuGET packaging

