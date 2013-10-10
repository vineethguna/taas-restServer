//dependencies
var mysql = require('./dbConfig');
var constants = require('./constants');
var queryGenerator = require('./queryGenerator');
var helper = require('./helper');
var logger = require('./logger');


//creating a pool of resources for mysql
var pool = mysql.pool;

exports.CreateApp = function(req, res){
    var appName = req.params.appName;
    var parameters = [appName];
    if(helper.checkForNullValues(parameters) && appName != 'apps'){
        pool.getConnection(function(err, connection){
           if(!err){
               logger.log('info', constants.ConnectionEstablishedLog);
               var query = queryGenerator.InsertRecordQuery(connection, constants.APPS, ["name"], [appName]);
               connection.query(query, function(err, result){
                  if(!err){
                        logger.log('success', constants.SuccessLog);
                        res.json({"id": result.insertId, "name": appName});
                  }
                  else{
                      mysql.ErrorHandler(res,err);
                  }
               });
               connection.release();
               logger.log('info', constants.ConnectionReleasedLog);
           }
           else{
                logger.log('error', constants.DatabaseConnectionError);
                res.json(constants.DatabaseConnectionError);
           }
        });
    }
    else{
        logger.log('error', constants.InternalErrorLog);
        res.json(constants.InvalidParameters);
    }
}

exports.DeleteApp = function(req, res){
    if(req.method == 'DELETE'){
        var app_name = req.body.appName;
        var parameters = [app_name];
        if(helper.checkForNullValues(parameters)){

        }
        else{
            res.json(constants.InvalidParameters);
        }
    }
    else{
        res.json(constants.methodNotFound);
    }

}

exports.UpdateApp = function(req, res){
    if(req.method == 'PUT'){
        var present_app_name = req.body.presentAppName;
        var new_app_name = req.body.newAppName;
        var parameters = [present_app_name, new_app_name];
        if(helper.checkForNullValues(parameters)){

        }
        else{
            res.json(constants.InvalidParameters);
        }
    }
    else{
        res.json(constants.methodNotFound);
    }
}
