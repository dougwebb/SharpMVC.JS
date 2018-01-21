# SharpMVC.JS
## Javascript Framework for ASP.Net MVC Core Projects

Every Javascript framework seems targeted to use cases where the server-side framework either doesn't exist or is a very basic data-access layer that returns JSON data responses. For ASP.Net MVC developers, this is *not* the case. 

* We have a fantastic server-side templating engine in Razor.
* We have a way to specify model validation rules using property attributes that are applied server-side during data binding when a form is submitted as well as client-side when the form is rendered using Razor's helpers.
* We have very flexible support for handling requests, and can easily do the data-lookup + JSON response thing.
* We're often working in Enterprise systems, where our data model classes and data-access layers are shared by other components in the system, including other GUIs. Having the validation rules specified on the model's properties allows them to express business rules that are obeyed across the system. You just can't do that with a client-side-only Javascript framework without duplicating logic.

## TODO

* Copy in existing code and get it working standalone from existing codebase
* Setup NuGET packaging
