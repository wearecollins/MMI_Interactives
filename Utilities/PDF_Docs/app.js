var markdownpdf = require("markdown-pdf")

var path = __dirname + "/../../"

var mdDocs = [path + "Readme.md", path + "Sharing/README.md", path + "Webserver/README.md"]
  , bookPath = path + "Readme.pdf"

markdownpdf().concat.from(mdDocs).to(bookPath, function () {
  console.log("Created", bookPath)
})