
var constants = require('./constants');
var logger = require('./logger');

exports.index = function(req, res){
  logger.log('info', "Fetching functions of rest server");
  res.json(constants.index);
};


exports.ErrorData = function(req, res){
    logger.log('error', constants.MethodNotFoundLog);
    res.json(constants.methodNotFound);
};