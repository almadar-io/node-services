// basic route (http://localhost:8080)
import express from 'express';

// ---------------------------------------------------------
// get an instance of the router for api routes
// ---------------------------------------------------------
var apiRoutes = express.Router();

function auth({
    app
}) {
    apiRoutes.get('/', function(req, res) {
        res.send('Hello! Hello service is working');
    });
    return apiRoutes;
}

export default auth;
