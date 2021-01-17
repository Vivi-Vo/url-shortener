# URL Shortener Microservice
Demo link: https://the-short-url.herokuapp.com/

## Example usage:
### Create a New Shorten URL 

`POST /api/shorturl/new`

Example response: 
> { original_url : 'https://freeCodeCamp.org', short_url : 1}
---
### Redirect to new URL
https://the-short-url.herokuapp.com/api/shorturl/<short_url> will be redirected to the original URL

---
### View all URLs
`GET /api/shorturl/viewAll`

Example response: 
> [
   {
      "originalURL":"https://www.netflix.com/",
      "shortURL":"ae6dd"
   },
   {
      "originalURL":"https://www.google.com/",
      "shortURL":"d0e19"
   },
   {
      "originalURL":"https://www.facebook.com/",
      "shortURL":"0b2df"
   }
]



