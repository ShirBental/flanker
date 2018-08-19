
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000
const fs=require('fs');

var resFile='data.csv';
var writeToFile=function(req,res) {
    console.log(req,res);
    console.log(req.body);
    var output=req.body;

    //"test":[{"startTime":"2018-08-18T19:00:00.352Z","target":"H","flanker":"R","status":"done","message":"מהרו!","reAction":false,
    //"test":[{"startTime":"2018-08-18T19:00:00.352Z","target":"H","flanker":"R","status":"done","message":"מהרו!","reAction":false,
    // "clicks":[{"k":"h","timePress":"2018-08-18T19:00:07.188Z","timeUp":"2018-08-18T19:00:10.045Z","timePressed":2857},{"k":"h","timePress":"2018-08-18T19:00:10.133Z"}]},
    // {"startTime":"2018-08-18T19:00:00.352Z","target":"H","flanker":"R","status":"done","message":"מהרו!","reAction":false,"clicks":[{"k":"h","timePress":"2018-08-18T19:00:10.339Z","timeUp":"2018-08-18T19:00:10.461Z","timePressed":122},{"k":"h","timePress":"2018-08-18T19:00:10.493Z"}]},{"startTime":"2018-08-18T19:00:00.352Z","target":"H","flanker":"R","status":"done","message":"מהרו!","reAction":false,"clicks":[{"k":"h","timePress":"2018-08-18T19:00:14.194Z"}]}]}
    finalString = "";
    finalString += output.demographic_details.mobile + ',';
    finalString += output.demographic_details.gender + ',';
    finalString += output.demographic_details.age + ',';
    finalString += output.demographic_details.learningDisabilities + ',';
    testData = output.test;
    for(var i=0; i<testData.length; i++) {
        var currentTest = testData[i];
        finalString += 'Round ' + i + ',';
        finalString += currentTest.target + ',';
        finalString += currentTest.flanker + ',';
        finalString += currentTest.reAction + ',';
        finalString += currentTest.startTime + ',';
        for(var j=0; j<currentTest.clicks.length; j++) {
            var currentClick = currentTest.clicks[j];
            finalString += 'Click ' + j + ',';
            finalString += currentClick.k + ',';
            finalString += currentClick.timePress + ',';
            finalString += currentClick.timeUp + ',';
            finalString += currentClick.timePressed + ',';
            finalString += currentClick.timePressed + ',';
        }
    }
    finalString += 'End of data';

    //fs.appendFile(resFile, JSON.stringify(output)+'\n', function (err) {
    fs.appendFile(resFile, finalString+'\n', function (err) {
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


