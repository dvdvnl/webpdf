const fs = require('fs');
const puppeteer = require('puppeteer');
const uniqid = require('uniqid');

const express = require('express');
const app = express();
const port = 3000;

const filePath = 'src/tmp/';
const fileExtension = '.pdf';
const fileName = uniqid() + fileExtension;

// Create file path
try {
  fs.mkdirSync(filePath);
  console.log(`The directory '${filePath}' was created.`);
} catch (error) {
  console.log(`The directory '${filePath}' already exists. No action required.`);
}

/**
 * Create PDF doc and display it
 */
app.get('/', (req, res) => {
  (async () => {
    try {
      // Create PDF
      const fileURI = await createPDF(req);

      // Display file
      fs.readFile(fileURI, (err, data) => {
        res.contentType('application/pdf');
        res.send(data);
      });

      // Delete file after download/view
      res.on('finish', () => {
        fs.unlink(fileURI, () => { });
        cleanup();
      });
    } catch (err) {
      res.status(500)
    }
  })();
});

/**
 * Create PDF doc and offer it for download
 */
app.get('/download', (req, res) => {
  (async () => {
    try {
      const downloadName = decodeURI(req.query.downloadName);

      // Create PDF
      const fileURI = await createPDF(req);

      // Offer file for download
      res.download(fileURI, (downloadName || 'download') + '.pdf');

      // Delete file after download/view
      res.on('finish', () => {
        fs.unlink(fileURI, () => { });
        cleanup();
      });
    } catch (err) {
      res.status(500)
    }
  })();
});

// Listen to port
app.listen(port, () => console.log(`PDF creator is listening on port :${port}.`));

/**
 * Create PDF document based on request information
 * @param {Request} req Original request
 */
async function createPDF(req) {
  try {
    const url = decodeURI(req.query.url);
    // const docTitle = decodeURI(req.query.docTitle);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const fileURI = filePath + fileName;

    // Load target page
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Create PDF
    await page.pdf({
      path: fileURI,
      format: 'A4',
      margin: {
        top: '1.2cm',
        right: '1.2cm',
        bottom: '1.2cm',
        left: '1.2cm'
      }
    });

    // Close browser
    await browser.close();

    return await fileURI;
  } catch (err) {
    throw new Error(err);
  }
}

/**
 * Clean up tmp directory for old files
 * @param {integer} age Max file age in miliseconds
 */
function cleanup(age = 1000 * 60 * 60) {
  fs.readdirSync(filePath, (err, files) => {
    files.forEach((file) => {
      let mtime = fs.statSync(filePath + file).mtime.getTime();
      if (mtime < (Date.now() - age))
        fs.unlink(filePath + file, () => { });
    })
  })
}