
var constants = require('./constants');
var logger = require('./logger');
var apiDocs = require('./apiDocs');

exports.index = function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    logger.log('info', "Fetching functions of rest server");
    res.render('index.html');
};


exports.ErrorData = function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    logger.log('error', constants.MethodNotFoundLog);
    res.json(constants.methodNotFound);
};

exports.metadata = function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    res.json(apiDocs.metadata);
};

exports.appOperations = function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    res.json(apiDocs.appOperations);
};

exports.appTableOperations = function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    res.json(apiDocs.appTableOperations);
};

exports.apiDocs = function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    res.json(apiDocs.api);
}