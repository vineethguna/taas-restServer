/**
 * This file Contains constants which we use in the rest server
 **/

//Metadata Constants
exports.APPS = "apps";
exports.metadataEntities = "metadataEntities";
exports.metadataFields = "metadataFields";
exports.APPCols = ["id", "name"];
exports.metadataEntitiesCols = ["appID", "tableName"];
exports.metadataFieldsCols = ["appID", "tableName", "fieldName", "isRequired", "fieldType", "defaultvalue"];



//Authorization Constants


//Error JSON's
exports.methodNotFound = {"Error": "Requested Method Not Found"};
exports.InvalidParameters = {"Error": "Invalid Parameters given"};
exports.DatabaseConnectionError = {"Error": "Error Connecting to Database"};
exports.QueryFailed = {"Error": "Query Failed"};
exports.InternalError = {"Error": "Internal Error Occured"};
exports.DuplicateEntry = {"Error": "Duplicate Entry given"};
exports.appDoesNotExist = {"Error": "Given App Does Not exist"};

