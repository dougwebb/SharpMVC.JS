using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Newtonsoft.Json;

namespace SharpMVC
{
    public static class SM_JsonResult
    {
        /// <summary>
        /// Return a generic JSON response; allows arbitrary resultCode
        /// </summary>
        /// <param name="resultCode">Indicates whether the request was handled successfully or not</param>
        /// <param name="message">Optional text-only response</param>
        /// <param name="markup">Optional Razor-generated markup response</param>
        /// <param name="additionalData">Optional JSON data response</param>
        /// <param name="urlForward">Special case response: tell browser to load a new url</param>
        /// <param name="exception">The Exception object, if an exception occurred during processing</param>
        /// <param name="settings">Rarely needed; override default serializer settings</param>
        /// <returns>A JsonResult object</returns>
        public static JsonResult Response(string resultCode = "OK", string message = "", string markup = null, object additionalData = null, string urlForward = null, Exception exception = null, JsonSerializerSettings settings = null)
        {
            var result = new {
                resultCode = resultCode,
                message = message,
                markup = markup,
                urlForward = urlForward,
                exception = exception == null ? "" : exception.ToString(),
                additionalData = additionalData
            };

            if (settings == null)
                return new JsonResult(result);
            else
                return new JsonResult(result, settings);
        }

        /// <summary>
        /// Return a Successful JSON response: resultCode=OK
        /// </summary>
        /// <param name="message">Optional text-only response</param>
        /// <param name="markup">Optional Razor-generated markup response</param>
        /// <param name="additionalData">Optional JSON data response</param>
        /// <param name="urlForward">Special case response: tell browser to load a new url</param>
        /// <param name="settings">Rarely needed; override default serializer settings</param>
        /// <returns>A JsonResult object</returns>
        public static JsonResult Success(string message = "", string markup = null, object additionalData = null, string urlForward = null, JsonSerializerSettings settings = null)
        {
            return Response(
                message: message,
                markup: markup,
                additionalData: additionalData,
                urlForward: urlForward,
                settings: settings
            );
        }

        /// <summary>
        /// Return an Error JSON response: resultCode=ER, and possible Exception object
        /// </summary>
        /// <param name="message">Optional text-only response</param>
        /// <param name="markup">Optional Razor-generated markup response</param>
        /// <param name="additionalData">Optional JSON data response</param>
        /// <param name="urlForward">Special case response: tell browser to load a new url</param>
        /// <param name="exception">The Exception object, if an exception occurred during processing</param>
        /// <param name="settings">Rarely needed; override default serializer settings</param>
        /// <returns>A JsonResult object</returns>
        public static JsonResult Error(string message = "", string markup = null, object additionalData = null, string urlForward = null, Exception exception = null, JsonSerializerSettings settings = null)
        {
            return Response(
                resultCode: "ER",
                message: message,
                markup: markup,
                additionalData: additionalData,
                urlForward: urlForward,
                exception: exception,
                settings: settings
            );
        }

        /// <summary>
        /// Returns a "Not Authorized" error response
        /// </summary>
        /// <param name="settings">Rarely needed; override default serializer settings</param>
        /// <returns>A JsonResult object</returns>
        public static JsonResult NotAuthorized(JsonSerializerSettings settings = null)
        {
            return Error(message: "Not Authorized", settings: settings);
        }
    }
}
