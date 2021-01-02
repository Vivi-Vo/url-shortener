require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const crypto = require("crypto");
const urlObject = require("url").URL;

const dns = require("dns");

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
  originURL: String,
  hashURL: String,
});

const URL = mongoose.model("URL", urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use("/public", express.static(`${process.cwd()}/public`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

app.post("/api/shorturl/new", (req, res) => {
  var url = req.body.url;
  try {
    var urlObj = new urlObject(url);
    var addr = dns.lookup(urlObj.hostname, (err, addr, family) =>{
      if (err)
        res.json({ error: "Invalid URL" });
        return;
    })

    console.log(addr);
  } catch (TypeError) {
    res.json({ error: "Invalid URL" });
  }

  URL.countDocuments({ originURL: url }, (err, count) => {
    if (err) return console.error(err);
    if (count > 0) {
      res.sendStatus(201);
      return;
    }
  });

  var hash = crypto.createHash("sha256").update(url).digest("hex").slice(0, 5);
  var newURL = URL({
    originURL: url,
    hashURL: hash,
  });
  newURL.save((err, newURL) => {
    if (err) return console.error(err);
  });
  res.json(newURL);
});

app.get("/api/shorturl/viewAll", (req, res) => {
  URL.find({}, (err, urls) => {
    if (err) return console.error(err);
    res.json(urls);
  });
});

app.get("/api/shorturl/:hash", (req, res) => {
  URL.findOne({ hashURL: req.params.hash }, (err, url) => {
    if (err || url === null) 
      return  res.json({ error: "Invalid URL" });

    res.redirect(301, url.originURL);
  });
});

app.delete("/api/shorturl/delete", (req, res) => {
  URL.deleteMany({}, (err) => {
    if (err) return console.error(err);
    res.sendStatus(200);
  });
});
