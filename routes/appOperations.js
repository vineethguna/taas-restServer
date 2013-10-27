//dependencies
var mysql = require('./dbConfig');
var constants = require('./constants');
var queryGenerator = require('./queryGenerator');
var helper = require('./helper');
var logger = require('./logger');


//creating a pool of resources for mysql
var pool = mysql.pool;

exports.CreateApp = function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
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
                        res.json({data:[{"id": result.insertId, "name": appName}]});
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
};

exports.DeleteApp = function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    var appName = req.params.appName;
    var parameters = [appName];
    if(helper.checkForNullValues(parameters) && req.get('Content-Type') == 'application/json'){
        pool.getConnection(function(err, connection){
            if(!err){
                logger.log('info', constants.ConnectionEstablishedLog);
                var query = queryGenerator.SelectTableQuery(connection, constants.APPS, "id", "name eq '" + appName + "'");
                connection.query(query, function(err, result){
                    if(!err && result.length > 0){
                        var appID = result[0].id;
                        query = queryGenerator.SelectTableQuery(connection, constants.metadataEntities, "tableName",
                            "appID eq " + appID);
                        connection.query(query, function(err, result){
                           if(!err){
                               var multipleQueries = [], index = 0;
                               multipleQueries[index++] = 'BEGIN';
                               multipleQueries[index++] = "SET FOREIGN_KEY_CHECKS = 0";
                               multipleQueries[index++] = queryGenerator.DeleteRecordQuery(constants.APPS, "id eq " + appID);
                               if(result.length > 0){
                                   multipleQueries[index++] = queryGenerator.DeleteRecordQuery(constants.metadataEntities,
                                       "appID eq " + appID);
                                   multipleQueries[index++] = queryGenerator.DeleteRecordQuery(constants.metadataFields,
                                       "appID eq " + appID);
                                   for(var i=0; i < result.length; i++){
                                       multipleQueries[index++] = queryGenerator.DropTableQuery(appID + "_" + result[i].tableName);
                                   }
                               }
                               multipleQueries[index++] = "SET FOREIGN_KEY_CHECKS = 1";
                               query = multipleQueries.join(";");
                               logger.log('info', "(MULTIPLE QUERY): " + query);
                               connection.query(query, function(err, result){
                                    if(!err){
                                        connection.query("COMMIT", function(err, result){
                                            if(!err){
                                                logger.log('success', constants.SuccessLog);
                                                res.json(constants.appDeleted);
                                            }
                                            else{
                                                mysql.ErrorHandler(res,err);
                                            }
                                        });
                                    }
                                    else{
                                        console.log(err);
                                        mysql.ErrorHandler(res,err);
                                        connection.query("ROLLBACK", function(err, result){
                                            logger.log('success', "Rollback Successful");
                                            console.log(result);
                                        });
                                    }
                               });
                           }
                           else{
                               mysql.ErrorHandler(res,err);
                           }
                        });
                    }
                    else{
                        if(!err){
                            logger.log('error', "Given App Does Not exist");
                            res.json(constants.appDoesNotExist);
                        }
                        else{
                            mysql.ErrorHandler(res,err);
                        }
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
        res.json(constants.InvalidParameters);
    }

};

exports.UpdateApp = function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
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
};
