#! /usr/local/bin/node

var express = require('express');
var app = express();

app.use(express.static('static'));

// app.post('/upload', function (req, res) {
// 	var postData = '';

//   // res.send('Got a POST request');
// 	req.setEncoding('utf8');

// 	req.addListener('data', function(postDataChunk) {
// 	    postData += postDataChunk;
// 	});

// 	req.addListener('end', function() {
// 	    uploads.upload(res, postData);
// 	    // response.emit('next');
// 	});
// });

app.listen(8001, function () {
  console.log('Listening on port 8001');
});