var logger = require('./logger');
var mysql = require('./dbConfig');
var queryGenerator = require('./queryGenerator');
var constants = require('./constants');

//creating a pool of resources for mysql
var pool = mysql.pool;


handleResult = function(res, errorIfResultEmpty){
    return function(err, result){
        if(!err){
            logger.log('success', constants.SuccessLog);
            if(result.length > 0){
                res.json({"data": result});
            }
            else{
                res.json(errorIfResultEmpty);
            }
        }
        else{
            mysql.ErrorHandler(res,err);
        }
    }
};

//========================================================================================================================


//get apps metadata
exports.handleAppMetadata = function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    var appName = req.params.appName;
    if(appName == 'apps'){
        getAllRunningApps(req, res);
    }
    else{
        getAppMetadata(req, res, appName);
    }
};

//========================================================================================================================

//get all apps running
function getAllRunningApps(req, res){
    pool.getConnection(executeGetAllApps(res));
}

executeGetAllApps = function(res){
    return function(err, connection){
        if(!err){
            logger.log('info', constants.ConnectionEstablishedLog);
            var query = queryGenerator.SelectTableQuery(connection, constants.APPS, "*");
            connection.query(query, handleResult(res, constants.NoApps));
            connection.release();
            logger.log('info', constants.ConnectionReleasedLog);
        }
        else{
            logger.log('error', constants.DatabaseConnectionErrorLog);
            res.json(constants.DatabaseConnectionError);
        }
    }

};

//========================================================================================================================

//get tables related to specific app
function getAppMetadata(req, res, appName){
    pool.getConnection(executeGetAppMetaData(res, appName));
}

executeGetAppMetaData = function(res, appName){
    return function(err, connection){
        if(!err){
            var nestedQuery = queryGenerator.SelectTableQuery(connection, constants.APPS, "id", "name eq '" + appName + "'");
            var query = queryGenerator.SelectTableQuery(connection, constants.metadataEntities, "appID,tableName", "appID", null,
                null, null, nestedQuery);
            connection.query(query, handleResult(res, constants.Notables));
            connection.release();
            logger.log('info', constants.ConnectionReleasedLog);
        }
        else{
            logger.log('error', constants.DatabaseConnectionErrorLog);
            res.json(constants.DatabaseConnectionError);
        }
    }
};


//========================================================================================================================

//get app tables metadata
exports.getTableMetadata = function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    var appName = req.params.appName;
    var tableName = req.params.tableName;
    if(appName != null && tableName != null){
        pool.getConnection(executeGetTableMetadata(res, appName, tableName));
    }
    else{
        logger.log('error', constants.InternalErrorLog);
        res.json(constants.DatabaseConnectionError);
    }
};

executeGetTableMetadata = function(res, appName, tableName){
    return function(err, connection){
        if(!err){
            var nestedQuery = queryGenerator.SelectTableQuery(connection, constants.APPS, "id", "name eq '" + appName + "'");
            var whereCondition = "tableName eq '" + tableName + "' and appID";
            var query = queryGenerator.SelectTableQuery(connection, constants.metadataFields, "*", whereCondition, null,
                null, null, nestedQuery);
            connection.query(query, handleResult(res, constants.TableDoesNotExist));
            connection.release();
            logger.log('info', constants.ConnectionReleasedLog);
        }
        else{
            logger.log('error', constants.DatabaseConnectionErrorLog);
            res.json(constants.DatabaseConnectionError);
        }
    }
};