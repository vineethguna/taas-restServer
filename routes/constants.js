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
exports.methodNotFound = {"Error": "Requested Method Not Found or Requested URL not found"};
exports.InvalidParameters = {"Error": "Invalid Parameters given"};
exports.DatabaseConnectionError = {"Error": "Error Connecting to Database"};
exports.QueryFailed = {"Error": "Query Failed"};
exports.InternalError = {"Error": "Internal Error Occured"};
exports.DuplicateEntry = {"Error": "Duplicate Entry given"};
exports.appDoesNotExist = {"Error": "Given App Does Not exist"};
exports.ContentTypeMismatch = {"Error": "Content-type Mismatch, Contet-Type should be application/json"};
exports.NoApps = {"data": "No Apps Present"};
exports.Notables = {"data": "There are no tables Associated with this app or given app does not exist"};

//log Messages
exports.InternalErrorLog = "Internal Error Occurred";
exports.ConnectionReleasedLog = "MYSQL Connection Released";
exports.DatabaseConnectionErrorLog = "Error Connecting To Database";
exports.ConnectionEstablishedLog = "MYSQL Connection Established";
exports.SuccessLog = "Operation Successful";
exports.MethodNotFoundLog = "Given URL not found or Requested Method For given URL not found";
exports.ContentTypeMismatchLog = "Content-type Mismatch, Content-Type should be application/json";

