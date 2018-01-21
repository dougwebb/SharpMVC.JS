using System;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using SharpMVC;
using HelloWorld.Models;

namespace HelloWorld.Controllers
{
    public class HomeController : Controller
    {
        private ISM_ViewRenderService _viewRenderService;
        private IActionContextAccessor _actionContextAccessor;

        public HomeController(ISM_ViewRenderService renderService, IActionContextAccessor actionContextAccessor)
        {
            _viewRenderService = renderService;
            _actionContextAccessor = actionContextAccessor;
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        // Define the AJAX request handler. This must be async and return a Task, because the view rendering service is async.
        public async Task<JsonResult> CurrentTime()
        {
            // Define a model object to pass to the view. 
            var model = DateTime.Now;

            // Do a server-side rendering of the partial view, passing in the model.
            ViewBag.TimeType = "current";
            var markup = await _viewRenderService.RenderToStringAsync("CurrentTime", model, _actionContextAccessor, ViewData);

            return SM_JsonResult.Success(markup: markup);
        }
    }
}
