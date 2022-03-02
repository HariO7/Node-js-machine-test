require("dotenv").config();

const http = require("http");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const User = require("./models/user");
const { parse } = require("querystring");
const bcrypt = require("bcrypt");
const { appendFile } = require("fs/promises");

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

    if (url == "./login") {
      if (req.method == "POST") {
        collectRequestData(req, (result) => {
          const { Name, Password } = result;
          if (!(Name && Password)) {
            res.status(404).send("all input should be filled");
          }
          const getUser = async () => {
            const user = await User.findOne({ Name });
            if (bcrypt.compareSync(Password, user.password)) {
              console.log("ok");
            } else {
              console.log("no");
            }
          };
          getUser();
        });
      } else {
        url = "./login.html";
      }
    }

    if (url == "./register") {
      if (req.method === "POST") {
        collectRequestData(req, (result) => {
          const password = result.Password;
          bcrypt.hash(password, 10, function (err, hash) {
            const user = new User({
              name: result.Name,
              password: hash,
            });
            console.log(user);
            user.save();
            res.statusCode = 302;
            url = "./login.html";
            return res.end();
          });
          //     res.statusCode=302;
          //   res.setHeader('location','/login')
          //   res.writeHead(301,{Location: 'http://3000/login'})
          // url = './login.html';
          // console.log(url);
          //   return res.end();
        });
      } else {
        url = "./register.html";
      }
    }

    if (url == "./dashboard") {
      getUser = async () => {
        const users = [];
        const user = await User.find();
        for (obj in user) {
          console.log(user[obj]["name"]);
          let data = user[obj]["name"];
          users.push(`<h1>${data}</h1>`);
          fs.writeFileSync("./dashboard.html", `${data}`);
        }
        // const data =
        // fs.writeFileSync('dashboard.html',user)
        //         res.write('<html>');
        //    res.write('<head> <title> Hello TutorialsPoint </title> </head>');
        //    res.write(' <body> <h1>Hello</h1> users</body>');
        //    res.write('</html>');
        // res.end()
      };
      getUser()
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
