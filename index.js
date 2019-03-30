
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000
const fs=require('fs');


var configParams = {
    initTime:500,
    flankerTime:500,
    targetTime:1000,
    answer:1000,
    checkAgainTime:1000,
    rounds:[
        {
            startTime: new Date(),
            target:'H',
            flanker:'R',
            status:"init",
            message:"",
            reAction:false,
            clicks:[]
        },
        {
            startTime: new Date(),
            target:'H',
            flanker:'R',
            status:"init",
            message:"",
            reAction:false,
            clicks:[]
        },
        {
            startTime: new Date(),
            target:'H',
            flanker:'R',
            status:"init",
            message:"",
            reAction:false,
            clicks:[]
        }
    ]
};

var configFile='flankerConfig.json';
function writeConfig() {
    fs.writeFile(configFile,JSON.stringify(configParams));
};
function setConfig(req,res) {
    console.log("in set config");
    configParams=req.body;
    writeConfig();
    res.send('OK');
};

var loadConfig=function() {
    fs.readFile(configFile,function(err,data) {
        if (err) {
            console.log(err);
        }
        else {
            try {
                configParams = JSON.parse(data);
            }
            catch(err) {
                console.log('Failed loading JSON', err);
            }

        }
    });
};
loadConfig();

var resFile='data.csv';
var writeToFile=function(req,res) {
    console.log(req,res);
    console.log(req.body);
    var output=req.body;
    finalString = "";
    finalString += output.demographic_details.mobile + ',';
    finalString += output.demographic_details.gender + ',';
    finalString += output.demographic_details.age + ',';
    finalString += req.connection.remoteAddress + ',';
    finalString += output.demographic_details.learningDisabilities + ',';
    finalString +=output.demographic_details.education +',';
    finalString +=output.demographic_details.size+ ',';

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
        }
    }
    finalString += 'End of data';
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
    .get('/configPage', (req, res) => res.sendFile(path.join(__dirname,'config.html')))
    .get('/configParams', (req, res) => {
        res.send(JSON.stringify(configParams))
    })
    .post('/configParams', (req, res) => setConfig(req,res))
    .get('/download', function(req, res){
        res.download(resFile);
    })
    .get('/downloadParams', function(req, res){
        res.download(configFile);
    })
  .post('/results', (req, res) => writeToFile(req,res))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))


