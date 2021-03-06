var queryGenerator = require('./queryGenerator');
var mysql = require('./dbConfig');
var constants = require('./constants');
var helper = require('./helper');
var logger = require('./logger');

//creating a pool of resources for mysql
var pool = mysql.pool;

//========================================================================================================================

//This function creates a new table in the app

exports.createAppTable = function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    var contentType = req.get('Content-Type').toLowerCase().replace(/\s/g, '');
    if(contentType == 'application/json;charset=utf-8' || contentType == 'application/json'){
        var appName = req.params.appName;
        var tableName = req.params.tableName;
        var appID = null;
        var schema = helper.generateSchemaFromModelDef(req.body);
        if(appName != null && tableName != null && schema != null){
            pool.getConnection(executeCreateAppTable(req, res, appName, tableName, schema));
        }
        else{
            logger.log('error', constants.InternalErrorLog);
            res.json(constants.InternalError);
        }
    }
    else{
        logger.log('error', constants.ContentTypeMismatchLog);
        res.json(constants.ContentTypeMismatch);
    }

};

executeCreateAppTable = function(req, res, appName, tableName, schema){
    return function(err, connection){
        if(!err){
            logger.log('info', constants.ConnectionEstablishedLog);
            var query1 = "BEGIN";
            var query2 = queryGenerator.SelectTableQuery(connection, constants.APPS, "id", "name eq '" + appName + "'");
            var multipleQueries = [query1, query2].join(";");
            logger.log('info', "(MULTIPLE QUERY): " + multipleQueries);
            connection.query(multipleQueries, getAppDataFromAppsTable(req, res, connection, tableName, schema));
            connection.release();
            logger.log('info', constants.ConnectionReleasedLog);
        }
        else{
            logger.log('error', constants.DatabaseConnectionErrorLog);
            res.json(constants.DatabaseConnectionError);
        }
    }
};

getAppDataFromAppsTable = function(req, res, connection, tableName, schema){
    return function(err, results){
        if(!err && results[1].length > 0){
            var appID = results[1][0].id;
            var query = queryGenerator.SelectTableQuery(connection, constants.metadataEntities, "*",
                "appID eq "+ appID + " and tableName eq '" + tableName + "'");
            connection.query(query, insertDataIntoMetadataTableAndCreateTable(req, res, connection, appID, tableName, schema));
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
    }
};

insertDataIntoMetadataTableAndCreateTable = function(req, res, connection, appID, tableName, schema){
    return function(err, result){
        if(err == null && result.length == 0){
            var fieldMetadata = helper.getFieldInfoForMetaDataTable(appID, tableName, req.body);
            var query1 = queryGenerator.InsertMultipleRecordQuery(connection, constants.metadataFields,
                constants.metadataFieldsCols, fieldMetadata);
            var query2 = queryGenerator.InsertRecordQuery(connection,constants.metadataEntities,
                constants.metadataEntitiesCols, [appID, tableName]);
            var query3 = queryGenerator.CreateTableQuery(appID +'_'+tableName, schema);
            var multipleQueries = [query1, query2, query3].join(";");
            logger.log('info', "(MULTIPLE QUERY): " + multipleQueries);
            connection.query(multipleQueries, handleCreateAppTableReturnData(res, connection));
        }
        else{
            if(!err){
                logger.log("error", "Table already Exists");
                res.json({"Error": [{Message:"Table Already Exists"}]});
            }
            else{
                mysql.ErrorHandler(res,err);
            }
        }
    }
};

handleCreateAppTableReturnData = function(res, connection){
    return function(err, result){
        if(!err){
            connection.query("COMMIT", function(err, result){
                if(!err){
                    logger.log('success', constants.SuccessLog);
                    res.json({data:[{"Success": "Transaction Succeeded"}]});
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
    }
};

//========================================================================================================================

//This function handles insertion of records into tables in app

exports.insertIntoAppTable = function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    var appName = req.params.appName;
    var tableName = req.params.tableName;
    if(appName != null && tableName != null){
        pool.getConnection(executeInsertIntoAppTable(req, res, appName, tableName));
    }
    else{
        logger.log('error', constants.InternalErrorLog);
        res.json(constants.InternalError);
    }

};

executeInsertIntoAppTable = function(req, res, appName, tableName){
    return function(err, connection){
        if(!err){
            logger.log('info', constants.ConnectionEstablishedLog);
            var fieldsInfo = helper.returnFieldsAndFieldValues(req.body);
            var query = queryGenerator.SelectTableQuery(connection, constants.APPS, "id", "name eq '" + appName + "'");
            connection.query(query, executeInsertRecord(res, connection, tableName, fieldsInfo));
            connection.release();
            logger.log('info', constants.ConnectionReleasedLog);
        }
        else{
            logger.log('error', constants.DatabaseConnectionErrorLog);
            res.json(constants.DatabaseConnectionError);
        }
    }
};


executeInsertRecord = function(res, connection, tableName, fieldsInfo){
    return function(err, result){
        if(!err && result.length > 0){
            tableName = result[0].id + '_' + tableName;
            var query = queryGenerator.InsertRecordQuery(connection, tableName, fieldsInfo[0], fieldsInfo[1]);
            connection.query(query, handleInsertIntoAppTableReturnData(res));
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
    }
};

handleInsertIntoAppTableReturnData = function(res){
    return function(err, result){
        if(!err){
            logger.log('success', constants.SuccessLog);
            res.json({data:[{"id": result.insertId}]});
        }
        else{
            mysql.ErrorHandler(res,err);
        }
    }
};


//========================================================================================================================

//This function fetches records from table in app

exports.fetchRecordsFromAppTable = function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    var appName = req.params.appName;
    var tableName = req.params.tableName;
    if(appName != null && tableName != null){
        pool.getConnection(executeFetchRecordsFromAppTable(req, res, appName, tableName));
    }
    else{
         logger.log('error', constants.InternalErrorLog);
         res.json(constants.InternalError);
    }
};


executeFetchRecordsFromAppTable = function(req, res, appName, tableName){
    return function(err, connection){
        if(!err){
            logger.log('info', constants.ConnectionEstablishedLog);
            var query = queryGenerator.SelectTableQuery(connection, constants.APPS, "id", "name eq '" + appName + "'");
            connection.query(query, executeFetchRecords(req, res, connection, tableName));
            connection.release();
            logger.log('info', constants.ConnectionReleasedLog);
        }
        else{
            logger.log('error', constants.DatabaseConnectionErrorLog);
            res.json(constants.DatabaseConnectionError);
        }
    }
};


executeFetchRecords = function(req, res, connection, tableName){
    return function(err, result){
        if(!err && result.length > 0){
            tableName = result[0].id + "_" + tableName;
            var query = queryGenerator.SelectTableQuery(connection, tableName, req.query.filter, req.query.where, req.query.orderby,
                req.query.groupby, req.query.limit);
            connection.query(query, handleFetchRecordsFromAppTableReturnData(res));
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
    }
};

handleFetchRecordsFromAppTableReturnData = function(res){
    return function(err, result){
        if(!err){
            logger.log('success', constants.SuccessLog);
            res.json({"data": result});
        }
        else{
            mysql.ErrorHandler(res,err);
        }
    }
};

//========================================================================================================================

//This function deletes records from table in app

exports.DeleteRecordsFromTable = function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    var contentType = req.get('Content-Type').toLowerCase().replace(/\s/g, '');
    if(contentType == 'application/json;charset=utf-8' || contentType == 'application/json'){
        var appName = req.params.appName;
        var tableName = req.params.tableName;
        if(appName != null && tableName != null){
            pool.getConnection(executeDeleteRecordsFromTable(req, res, appName, tableName));
        }
        else{
            logger.log('error', constants.InternalErrorLog);
            res.json(constants.InternalError);
        }
    }
    else{
        logger.log('error', constants.ContentTypeMismatchLog);
        res.json(constants.ContentTypeMismatch);
    }
};

executeDeleteRecordsFromTable = function(req, res, appName, tableName){
    return function(err, connection){
        if(!err){
            logger.log('info', constants.ConnectionEstablishedLog);
            var query = queryGenerator.SelectTableQuery(connection, constants.APPS, "id", "name eq '" + appName + "'");
            connection.query(query, executeDeleteRecords(req, res, connection, tableName));
            connection.release();
            logger.log('info', constants.ConnectionReleasedLog);
        }
        else{
            logger.log('error', constants.DatabaseConnectionErrorLog);
            res.json(constants.DatabaseConnectionError);
        }
    }
};

executeDeleteRecords = function(req, res, connection, tableName){
    return function(err, result){
        if(!err && result.length > 0){
            tableName = result[0].id + '_' + tableName;
            var query = queryGenerator.DeleteRecordQuery(tableName, req.query.where, req.query.orderBy,
                req.query.limit);
            connection.query(query, handleDeleteRecordsFromTableReturnData(res));
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
    }
};

handleDeleteRecordsFromTableReturnData = function(res){
    return function(err, result){
        if(!err){
            res.json(constants.RecordDeleted);
        }
        else{
            mysql.ErrorHandler(res, err);
        }
    }
};

//========================================================================================================================

//This function updates Records in table in app

exports.UpdateRecordInTable = function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    var contentType = req.get('Content-Type').toLowerCase().replace(/\s/g, '');
    if(contentType == 'application/json;charset=utf-8' || contentType == 'application/json'){
        var appName = req.params.appName;
        var tableName = req.params.tableName;
        if(appName != null && tableName != null){
            pool.getConnection(executeUpdateRecordInTable(req, res, appName, tableName));
        }
        else{
            logger.log('error', constants.InternalErrorLog);
            res.json(constants.InternalError);
        }
    }
    else{
        logger.log('error', constants.ContentTypeMismatchLog);
        res.json(constants.ContentTypeMismatch);
    }
};

executeUpdateRecordInTable = function(req, res, appName, tableName){
    return function(err, connection){
        if(!err){
            logger.log('info', constants.ConnectionEstablishedLog);
            var query = queryGenerator.SelectTableQuery(connection, constants.APPS, "id", "name eq '" + appName + "'");
            connection.query(query, executeUpdateRecords(req, res, connection, tableName));
            connection.release();
            logger.log('info', constants.ConnectionReleasedLog);
        }
        else{
            logger.log('error', constants.DatabaseConnectionErrorLog);
            res.json(constants.DatabaseConnectionError);
        }
    }
};

executeUpdateRecords = function(req, res, connection, tableName){
    return function(err, result){
        if(!err && result.length > 0){
            tableName = result[0].id + '_' + tableName;
            var query = queryGenerator.UpdateRecordQuery(connection, tableName, req.body.set, req.body.where,
                req.body.orderBy, req.body.limit);
            connection.query(query, handleUpdateRecordInTableReturnData(res));
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
    }
};

handleUpdateRecordInTableReturnData = function(res){
    return function(err, result){
        if(!err){
            res.json(constants.Recordupdated);
        }
        else{
            console.log(err);
            mysql.ErrorHandler(res, err);
        }
    }
};

//========================================================================================================================


//This function drops table in App

exports.DropTable = function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    var appName = req.params.appName;
    var tableName = req.params.tableName;
    if(appName != null && tableName != null){
        pool.getConnection(executeDropTable(res, appName, tableName));
    }
    else{
        logger.log('error', constants.InternalErrorLog);
        res.json(constants.InternalError);
    }
};


executeDropTable = function(res, appName, tableName){
    return function(err, connection){
        if(!err){
            logger.log('info', constants.ConnectionEstablishedLog);
            var query = queryGenerator.SelectTableQuery(connection, constants.APPS, "id", "name eq '" + appName + "'");
            connection.query(query, getDataFromMetadataAndDropTable(res, connection, tableName));
            connection.release();
            logger.log('info', constants.ConnectionReleasedLog);
        }
        else{
            logger.log('error', constants.DatabaseConnectionErrorLog);
            res.json(constants.DatabaseConnectionError);
        }
    }
};

getDataFromMetadataAndDropTable = function(res, connection, tableName){
    return function(err, result){
        if(!err && result.length > 0){
            var appID = result[0].id;
            var where = "appID eq " + result[0].id + " and tableName eq '" + tableName + "'";
            var query = queryGenerator.SelectTableQuery(connection, constants.metadataEntities, "tableName", where);
            connection.query(query, function(err, result){
                if(!err && result.length > 0){
                    var multipleQueries = [], index = 0;
                    multipleQueries[index++] = "BEGIN";
                    multipleQueries[index++] = queryGenerator.DeleteRecordQuery(constants.metadataEntities, where);
                    multipleQueries[index++] = queryGenerator.DeleteRecordQuery(constants.metadataFields, where);
                    tableName = appID + "_" + tableName;
                    multipleQueries[index++] = queryGenerator.DropTableQuery(tableName);
                    query = multipleQueries.join(";");
                    logger.log('info', "(MULTIPLE QUERY): " + query);
                    connection.query(query, handleDropTableReturnData(res, connection));
                }
                else{
                    if(!err){
                        logger.log('error', "Given Table Does Not exist");
                        res.json(constants.TableDoesNotExist);
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
    }
};

handleDropTableReturnData = function(res, connection){
    return function(err, result){
        if(!err){
            connection.query("COMMIT", function(err, result){
                if(!err){
                    logger.log('success', constants.SuccessLog);
                    res.json(constants.dropTableSuccess);
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
    }
};


//========================================================================================================================

//This function provides joins on tables

exports.JoinOnTables = function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    var contentType = req.get('Content-Type').toLowerCase().replace(/\s/g, '');
    if(contentType == 'application/json;charset=utf-8' || contentType == 'application/json'){
        var appName = req.params.appName;
        if(appName != null){
            pool.getConnection(executeJoinOnTables(req, res, appName));
        }
        else{
            logger.log('error', constants.InternalErrorLog);
            res.json(constants.InternalError);
        }
    }
    else{
        logger.log('error', constants.ContentTypeMismatchLog);
        res.json(constants.ContentTypeMismatch);
    }
};

executeJoinOnTables = function(req, res, appName){
    return function(err, connection){
        if(!err){
            logger.log('info', constants.ConnectionEstablishedLog);
            var query = queryGenerator.SelectTableQuery(connection, constants.APPS, "id", "name eq '" + appName + "'");
            connection.query(query, executeJoin(req, res, connection));
            connection.release();
            logger.log('info', constants.ConnectionReleasedLog);
        }
        else{
            logger.log('error', constants.DatabaseConnectionErrorLog);
            res.json(constants.DatabaseConnectionError);
        }
    }
};

executeJoin = function(req, res, connection){
    return function(err, result){
        if(!err && result.length > 0){
            var appID = result[0].id;
            var query = helper.processJoinData(connection, appID, req.body);
            connection.query(query, handleJoinOnTablesReturnData(res));
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
    }
};

handleJoinOnTablesReturnData = function(res){
    return function(err, result){
        if(!err){
            logger.log('success', constants.SuccessLog);
            res.json({"data": result});
        }
        else{
            mysql.ErrorHandler(res, err);
        }
    }
};