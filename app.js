require("dotenv").config();

const http = require("http");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const User = require("./models/user");
const { parse } = require("querystring");

mongoose.connect(process.env.DATABASE_URL, () => {
  console.log("connected to database");
});

function collectRequestData(request, callback) {
  const FORM_URLENCODED = "application/x-www-form-urlencoded";
  if (request.headers["content-type"] === FORM_URLENCODED) {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk.toString();
    });
    request.on("end", () => {
      callback(parse(body));
    });
  } else {
    callback(null);
  }
}

http
  .createServer(function (req, res) {
    console.log("request ", req.url);

    let url = "." + req.url;
    if (url == "./index") {
      url = "./index.html";
    }
   
    if (url == "./register") {
      if (req.method === "POST") {
        collectRequestData(req, (result) => {
        //   const user = new User({
        //     name: result.Name,
        //     password: result.Password,
        //   });
        //   console.log(user);
        //   user.save();
            res.statusCode=302;
          res.setHeader('location','/login')
        //   res.writeHead(301,{Location: 'http://3000/login'})
        url = './login.html';
        console.log(url);
          return res.end();

        });
      } else {
        url = "./register.html";
      }
    }
    if (url == "./login") {
        url = "./login.html";
      }
    const extname = String(path.extname(url)).toLowerCase();
    const mimeTypes = {
      ".html": "text/html",
      ".js": "text/javascript",
      ".css": "text/css",
      ".json": "application/json",
    };

    var contentType = mimeTypes[extname];

    fs.readFile(url, function (error, content) {
      if (error) {
        if (error.code == "ENOENT") {
          fs.readFile("./404.html", function (error, content) {
            res.writeHead(404, { "Content-Type": "text/html" });
            res.end(content, "utf-8");
          });
        } else {
          res.writeHead(500);
          res.end(
            "Sorry, check with the site admin for error: " +
              error.code +
              " ..\n"
          );
        }
      } else {
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content, "utf-8");
      }
    });
  })

  .listen(3000);
console.log("Server running at http://127.0.0.1:3000/");
