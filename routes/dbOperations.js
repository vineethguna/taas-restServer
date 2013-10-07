var queryGenerator = require('./queryGenerator');
var mysql = require('./dbConfig');
var constants = require('./constants');
var helper = require('./helper');

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
                var query1 = "BEGIN";
                var query2 = queryGenerator.SelectTableQuery(connection, constants.APPS, "id", "name eq '" + appName + "'");
                var multipleQueries = [query1, query2].join(";");
                connection.query(multipleQueries, function(err, results){
                   if(!err && results[1].length > 0){
                       appID = results[1][0].id;
                       var query = queryGenerator.SelectTableQuery(connection, constants.metadataEntities, "*",
                       "appID eq "+ appID + " and tableName eq '" + tableName + "'");
                       connection.query(query, function(err, result){
                           console.log(err);
                           console.log(result);
                           if(err == null && result.length == 0){
                               var fieldMetadata = helper.getFieldInfoForMetaDataTable(appID, tableName, req.body);
                               var query1 = queryGenerator.InsertMultipleRecordQuery(connection, constants.metadataFields,
                                   constants.metadataFieldsCols, fieldMetadata);
                               var query2 = queryGenerator.InsertRecordQuery(connection,constants.metadataEntities,
                                   constants.metadataEntitiesCols, [appID, tableName]);
                               var query3 = queryGenerator.CreateTableQuery(appID +'_'+tableName, schema);
                               multipleQueries = [query1, query2, query3].join(";");
                               connection.query(multipleQueries, function(err, results){
                                   if(!err){
                                       connection.query("COMMIT", function(err, result){
                                           if(!err){
                                               res.json({"Success": "Transaction Succeded"});
                                           }
                                           else{
                                               res.json({"Error": "Transaction failed"});
                                           }
                                       });
                                   }
                                   else{
                                       console.log(err);
                                       res.json({"Error": "Transaction failed"});
                                       connection.query("ROLLBACK", function(err, result){
                                           console.log(result);
                                       });
                                   }
                               });
                           }
                           else{
                               res.json({"Error": "Table Already Exists"});
                           }
                       });

                   }
                   else{
                        console.log(err);
                       res.json({"Error": "Transaction failed"});
                   }

                });
                connection.release();
            }
            else{
                res.json(constants.DatabaseConnectionError);
            }
        });
    }
    else{
        res.json(constants.InternalError);
    }

}


exports.insertIntoAppTable = function(req, res){
    var appName = req.params.appName;
    var tableName = req.params.tableName;
    if(appName != null && tableName != null){
        pool.getConnection(function(err, connection){
           if(!err){
               fieldsInfo = helper.returnFieldsAndFieldValues(req.body);
               var query = queryGenerator.SelectTableQuery(connection, constants.APPS, "id", "name eq '" + appName + "'");
               connection.query(query, function(err, result){
                   if(!err){
                       tableName = result[0].id + '_' + tableName;
                       query = queryGenerator.InsertRecordQuery(connection, tableName, fieldsInfo[0], fieldsInfo[1]);
                       connection.query(query, function(err, result){
                          if(!err){
                                res.json({"id": result.insertId});
                          }
                          else{
                              console.log(err);
                              res.json(constants.QueryFailed);
                          }
                       });
                   }
                   else{
                        console.log(err);
                        res.json(constants.QueryFailed);
                   }
               });
               connection.release();
           }
           else{
                res.json(constants.DatabaseConnectionError);
           }
        });
    }
    else{
        res.json(constants.InternalError);
    }

};

exports.fetchRecordsFromAppTable = function(req, res){
    var appName = req.params.appName;
    var tableName = req.params.tableName;
    if(appName != null && tableName != null){
        pool.getConnection(function(err, connection){
            if(!err){
                var query = queryGenerator.SelectTableQuery(connection, constants.APPS, "id", "name eq '" + appName + "'");
                connection.query(query, function(err, result){
                    if(!err){
                        tableName = result[0].id + "_" + tableName;
                        query = queryGenerator.SelectTableQuery(connection, tableName, req.query.filter, req.query.where, req.query.orderby,
                            req.query.groupby, req.query.limit);
                        connection.query(query, function(err, result){
                            if(!err){
                                res.json({"data": result});
                            }
                            else{
                                console.log(err);
                                res.json(constants.QueryFailed);
                            }
                        });
                    }
                    else{
                        console.log(err);
                        res.json(constants.QueryFailed);
                    }
                });
                connection.release();
            }
            else{
                res.json(constants.DatabaseConnectionError);
            }
        });
    }
    else{
         res.json(constants.InternalError);
    }
}