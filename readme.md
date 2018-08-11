# How static data works
* For any given request, the request route is mapped to the hierarchy under the static-json folder.
* Routes begin with `'/'`, so `'/{myResource}/{myIdenifier}'` will map directly to `'static-json/{myResource}/{myIdentifier}.json'`.
* Fallbacks are available; any token in the route that cannot map directly will attempt to map to a folder/file called `'_'`.
* For example, `'/myResource'` will attempt to map to `'static-json/myResouce.json'`, and if it cannot, will attempt to map to `'static-json/_.json'`.
* This works for folders as well; for example, `'/people/1234/hobbies/hockey'` will map to:
  * If available, `'static-json/people/1234/hobbies/hockey.json'`
  * Then, `'static-json/_/1234/hobbies/hockey.json'`
  * Then, `'static-json/(people | _)/(1234 | _)/hobbies/hockey.json'`
  * And on, ending with the most desperate attempt to match, `'static-json/_/_/_/_.json'`
  * The tokenization is progressive, so any given token may be a fallback without breaking the hierarchy.
* Once a valid JSON file is found for the request route, the server looks for a valid entry matching the request method
* Valid JSON response files should match this format:
`{
     "method": {
         "statusCode": httpStatusCode,
         "body" : {
             // some data
         }
     }
 }`
  * __method__ should be a valid HTTP method, spelled in lowercase (get, post, put, etc.).
  * __httpStatusCode__ should be a valid HTTP response status code (200, 404, 500, etc.).
  * __body__ should contain the raw JSON you desire as a response.

# Unsupported but potential future features
* Fallbacks for methods
* Pattern matching to choose responses based on:
  * Headers and header values
  * Query string parameters
  * Request body content (for appropriate methods)
