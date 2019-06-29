const MongoClient = require('mongodb').MongoClient;
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000
const fs=require('fs');
const url = 'mongodb://heroku_6k3mx0zf:g75e40stilmledp6bjcjepbm91@ds159782.mlab.com:59782/heroku_6k3mx0zf';
const assert = require('assert');
// Database Name
const dbName = 'heroku_6k3mx0zf';

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
    MongoClient.connect(url, function(err, client) {
        assert.equal(null, err);
        console.log("Connected successfully to server");

        const db = client.db(dbName);
        const collection = db.collection('configParams');
        collection.remove({},function(err,result) {
            collection.insert(configParams, function (err, result) {
                console.log(err, result);
                client.close();
            });
        });
    });
    res.send('OK');
};
MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);
    const collection = db.collection('configParams');
    collection.find({}).toArray(function (err,result) {
        configParams=result[0];
        client.close();
    })
    /*collection.insertMany([configParams],function (err,result) {
        console.log(result,err);
        client.close();
    })*/

});



var resFile='data.csv';
var writeToFile=function(req,res) {
    console.log(req,res);
    console.log(req.body);
    var output=req.body;
    var finalString = "";
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

    MongoClient.connect(url, function(err, client) {
        assert.equal(null, err);
        console.log("Connected successfully to server");

        const db = client.db(dbName);
        const collection = db.collection('flankerResults');
        collection.insert({results:finalString},function(err,result) {
            console.log('inserted',finalString,err,result);
            client.close();
        });
        /*collection.insertMany([configParams],function (err,result) {
            console.log(result,err);
            client.close();
        })*/

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
        MongoClient.connect(url, function(err, client) {
            assert.equal(null, err);
            console.log("Connected successfully to server");

            const db = client.db(dbName);
            const collection = db.collection('flankerResults');
            var answerCsv = 'Mobile,Gender,ID,IP,ADHD,Education,Resolution,Start rounds\n';
            collection.find({}).toArray(function (err,result) {
                for(var i=0; i<result.length; i++) {
                    if(result[i].results)
                        answerCsv = answerCsv + result[i].results + '\n';
                }
                console.log(answerCsv);
                res.set({"Content-Disposition":"attachment; filename=\"data.csv\""});
                res.send(answerCsv);

                client.close();

            });

        });

    })
    .get('/downloadParams', function(req, res){
        res.set({"Content-Disposition":"attachment; filename=\"flankerConfig.json\""});
        res.send(configParams);
    })
  .post('/results', (req, res) => writeToFile(req,res))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))


