require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const crypto = require("crypto");
const urlObject = require("url").URL;

const dns = require("dns");
const { nextTick } = require("process");

'use strict'


//DB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log(mongoose.connection.readyState);
});

const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String,
});

const URL = mongoose.model("URL", urlSchema);

function isUrlExisted(url) {
  var urlCount = 0;
  URL.countDocuments({
    original_url: url
  }, (err, count) => {
    if (err) return console.error(err);
    else {
      if (count > 0) {
        console.log('inside async' + count);
      }
    }
  });
  return urlCount;

}
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use("/public", express.static(`${process.cwd()}/public`));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

app.post("/api/shorturl/new", async (req, res) => {
  var url = req.body.url;
  try {
    const count = await URL.countDocuments({
        original_url: url,
      });

      if (count > 0) {
          console.log('existed url count:' + count);
          return res.json({
            error: 'url existed',
          });
  
      }
    if (!isUrlValid(url)) {
      return res.json({
        error: 'invalid url',
      });
    } else {
      var hash = crypto.createHash("sha256").update(url).digest("hex").slice(0, 5);
      var newURL = URL({
        original_url: url,
        short_url: hash,
      });
      newURL.save((err, newURL) => {
        if (err) return console.error(err);
      });
      res.json(newURL);
    }
  } catch (e) {
    res.json({
      error: 'invalid url',
    });
  }

});

app.get("/api/shorturl/viewAll", (req, res) => {
  URL.find({}, (err, urls) => {
    if (err) return console.error(err);
    res.json(urls);
  });
});

app.get("/api/shorturl/:hash", (req, res) => {
  URL.findOne({
      short_url: req.params.hash,
    },
    (err, url) => {
      if (err || url === null)
        return res.json({
          error: 'invalid url',
        });
      res.redirect(301, url.original_url);
    }
  );
});

app.delete("/api/shorturl/delete", (req, res) => {
  URL.deleteMany({}, (err) => {
    if (err) return console.error(err);
    res.sendStatus(200);
  });
});

// Credit @ https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
function isUrlValid(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
  return !!pattern.test(str);
}