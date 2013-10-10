
var constants = require('./constants');
var logger = require('./logger');

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};


exports.ErrorData = function(req, res){
    logger.log('error', constants.MethodNotFoundLog);
    res.json(constants.methodNotFound);
};