// basic route (http://localhost:8080)
const express = require('express');
const csv = require('csv-parser')
const fs = require('fs')

// ---------------------------------------------------------
// get an instance of the router for api routes
// ---------------------------------------------------------
var apiRoutes = express.Router();

module.exports =  function({
    app
}) {
    apiRoutes.get('/', function(req, res) {
        res.send('Hello! Hello service is working');
    });
    return apiRoutes;
}

const parseCSV = (filePath) => {
    let arr = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', function(data) {
                arr.push(data);
            })
            .on('end', function() {
                resolve(arr);
            })
    })
};

parseCSV('./data/CapitalOne.csv').then((data)=>{
    console.log(data);
});