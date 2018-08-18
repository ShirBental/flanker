
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000
const fs=require('fs');

var resFile='message.txt';
var writeToFile=function(req,res) {
    console.log(req,res);
    console.log(req.body);
    var output=req.body;
    fs.appendFile(resFile, JSON.stringify(output)+'\n', function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
    res.send('OK');

}

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use('/bower_components',express.static(path.join(__dirname, 'bower_components')))
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
.get('/', (req, res) => res.sendFile(path.join(__dirname,'index.html')))
    .get('/download', function(req, res){
        res.download(resFile);
    })
  .post('/results', (req, res) => writeToFile(req,res))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))


