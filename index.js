const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  fs.readdir("./hisaab", function (err, files) {
    if (err) {
      return res.status(500).send(err);
    }

    res.render("index", { files: files });
  });
});

app.get("/create", function (req, res) {
  // fs.writeFile('./hisaab',function(err){

  // })
  res.render("create");
});

app.post("/createhisaab", function (req, res) {
  const currentDate = new Date();
  const date = `${currentDate.getDate()}-${
    currentDate.getMonth() + 1
  }-${currentDate.getFullYear()}`;

  const directory = "./hisaab";
  let filename = `${date}.txt`;
  let filepath = path.join(directory, filename);
  let counter = 0;

  // Ensure the directory exists
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }

  // Function to check and create unique filename
  const checkFileAndWrite = (filepath, filename) => {
    fs.stat(filepath, (err) => {
      if (err) {
        // File does not exist, safe to write
        fs.writeFile(filepath, req.body.content, function (err) {
          if (err) {
            return res.status(500).send(err);
          }
          res.redirect("/");
        });
      } else {
        // File exists, generate new filename
        counter++;
        const newFilename = `${date}(${counter}).txt`;
        const newFilepath = path.join(directory, newFilename);
        checkFileAndWrite(newFilepath, newFilename); // Recursive check
      }
    });
  };

  // Start the process
  checkFileAndWrite(filepath, filename);
});

app.get("/edit/:filename", function (req, res) {
  fs.readFile(`./hisaab/${req.params.filename}`, "utf-8", (err, filedata) => {
    if (err) {
      return res.status(500).send(err);
    }

    res.render("edit", { filedata, filename: req.params.filename });
  });
});

app.post("/update/:filename", function (req, res) {
  fs.writeFile(
    `./hisaab/${req.params.filename}`,
    req.body.content,
    function (err) {
      if (err) {
        return res.status(500).send(err);
      }

      res.redirect("/");
    }
  );
});

app.get("/hisaab/:filename", function (req, res) {
  fs.readFile(
    `./hisaab/${req.params.filename}`,
    "utf-8",
    function (err, filedata) {
      if (err) {
        return res.status(500).send(err);
      }
      res.render("hisaab", { filedata, filename: req.params.filename });
    }
  );
});

app.get("/delete/:filename", function (req, res) {
  fs.unlink(`./hisaab/${req.params.filename}`, function (err) {
    if (err) {
      return res.status(500).send(err);
    }
    res.redirect("/");
  });
});

app.listen(3000);

