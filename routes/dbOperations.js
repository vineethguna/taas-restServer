var queryGenerator = require('./queryGenerator');
var mysql = require('./dbConfig');
var constants = require('./constants');
var helper = require('./helper');
var logger = require('./logger');

//creating a pool of resources for mysql
var pool = mysql.pool;

exports.createAppTable = function(req, res){
    var appName = req.params.appName;
    var tableName = req.params.tableName;
    var appID = null;
    var schema = helper.generateSchemaFromModelDef(req.body);
    if(appName != null && tableName != null && schema != null){
        pool.getConnection(function(err, connection){
            if(!err){
                logger.log('info', constants.ConnectionEstablishedLog);
                var query1 = "BEGIN";
                var query2 = queryGenerator.SelectTableQuery(connection, constants.APPS, "id", "name eq '" + appName + "'");
                var multipleQueries = [query1, query2].join(";");
                logger.log('info', "(MULTIPLE QUERY): " + multipleQueries);
                connection.query(multipleQueries, function(err, results){
                   if(!err && results[1].length > 0){
                       appID = results[1][0].id;
                       var query = queryGenerator.SelectTableQuery(connection, constants.metadataEntities, "*",
                       "appID eq "+ appID + " and tableName eq '" + tableName + "'");
                       connection.query(query, function(err, result){
                           if(err == null && result.length == 0){
                               var fieldMetadata = helper.getFieldInfoForMetaDataTable(appID, tableName, req.body);
                               var query1 = queryGenerator.InsertMultipleRecordQuery(connection, constants.metadataFields,
                                   constants.metadataFieldsCols, fieldMetadata);
                               var query2 = queryGenerator.InsertRecordQuery(connection,constants.metadataEntities,
                                   constants.metadataEntitiesCols, [appID, tableName]);
                               var query3 = queryGenerator.CreateTableQuery(appID +'_'+tableName, schema);
                               multipleQueries = [query1, query2, query3].join(";");
                               logger.log('info', "(MULTIPLE QUERY): " + multipleQueries);
                               connection.query(multipleQueries, function(err, results){
                                   if(!err){
                                       connection.query("COMMIT", function(err, result){
                                           if(!err){
                                               logger.log('success', constants.SuccessLog);
                                               res.json({"Success": "Transaction Succeded"});
                                           }
                                           else{
                                                mysql.ErrorHandler(res,err);
                                           }
                                       });
                                   }
                                   else{
                                       mysql.ErrorHandler(res,err);
                                       connection.query("ROLLBACK", function(err, result){
                                           logger.log('success', "Rollback Successful");
                                           console.log(result);
                                       });
                                   }
                               });
                           }
                           else{
                               if(!err){
                                   logger.log("error", "Table already Exists");
                                   res.json({"Error": "Table Already Exists"});
                               }
                               else{
                                   mysql.ErrorHandler(res,err);
                               }
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
                logger.log('error', constants.DatabaseConnectionErrorLog);
                res.json(constants.DatabaseConnectionError);
            }
        });
    }
    else{
        logger.log('error', constants.InternalErrorLog);
        res.json(constants.InternalError);
    }

}


exports.insertIntoAppTable = function(req, res){
    var appName = req.params.appName;
    var tableName = req.params.tableName;
    if(appName != null && tableName != null){
        pool.getConnection(function(err, connection){
           if(!err){
               logger.log('info', constants.ConnectionEstablishedLog);
               fieldsInfo = helper.returnFieldsAndFieldValues(req.body);
               var query = queryGenerator.SelectTableQuery(connection, constants.APPS, "id", "name eq '" + appName + "'");
               connection.query(query, function(err, result){
                   if(!err){
                       tableName = result[0].id + '_' + tableName;
                       query = queryGenerator.InsertRecordQuery(connection, tableName, fieldsInfo[0], fieldsInfo[1]);
                       connection.query(query, function(err, result){
                          if(!err){
                                logger.log('success', constants.SuccessLog);
                                res.json({"id": result.insertId});
                          }
                          else{
                              mysql.ErrorHandler(res,err);
                          }
                       });
                   }
                   else{
                       mysql.ErrorHandler(res,err);
                   }
               });
               connection.release();
               logger.log('info', constants.ConnectionReleasedLog);
           }
           else{
                logger.log('error', constants.DatabaseConnectionErrorLog);
                res.json(constants.DatabaseConnectionError);
           }
        });
    }
    else{
        logger.log('error', constants.InternalErrorLog);
        res.json(constants.InternalError);
    }

};

exports.fetchRecordsFromAppTable = function(req, res){
    var appName = req.params.appName;
    var tableName = req.params.tableName;
    if(appName != null && tableName != null){
        pool.getConnection(function(err, connection){
            if(!err){
                logger.log('info', constants.ConnectionEstablishedLog);
                var query = queryGenerator.SelectTableQuery(connection, constants.APPS, "id", "name eq '" + appName + "'");
                connection.query(query, function(err, result){
                    if(!err){
                        tableName = result[0].id + "_" + tableName;
                        query = queryGenerator.SelectTableQuery(connection, tableName, req.query.filter, req.query.where, req.query.orderby,
                            req.query.groupby, req.query.limit);
                        connection.query(query, function(err, result){
                            if(!err){
                                logger.log('success', constants.SuccessLog);
                                res.json({"data": result});
                            }
                            else{
                                mysql.ErrorHandler(res,err);
                            }
                        });
                    }
                    else{
                        mysql.ErrorHandler(res,err);
                    }
                });
                connection.release();
                logger.log('info', constants.ConnectionReleasedLog);
            }
            else{
                logger.log('error', constants.DatabaseConnectionErrorLog);
                res.json(constants.DatabaseConnectionError);
            }
        });
    }
    else{
         logger.log('error', constants.InternalErrorLog);
         res.json(constants.InternalError);
    }
}