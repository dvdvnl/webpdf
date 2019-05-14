# PDF Creator

This application creates PDF documents of websites, including SPA, using headless Chromium in combination with [Google's puppeteer](https://github.com/GoogleChrome/puppeteer).

## Endpoints

* `/` - Visualization only. The content type for PDF is sent and the PDF is usually rendered in the client.
* `/download` - The PDF is offered as download.

## Parameters

* `url` - The encoded URL of the target website.
* `downloadName`- The name of the file in case of a download.