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
exports.methodNotFound = {"Error": [{Message:"Requested Method Not Found or Requested URL not found"}]};
exports.InvalidParameters = {"Error": [{Message:"Invalid Parameters given"}]};
exports.DatabaseConnectionError = {"Error": [{Message:"Error Connecting to Database"}]};
exports.QueryFailed = {"Error": [{Message:"Query Failed"}]};
exports.InternalError = {"Error": [{Message:"Internal Error Occured"}]};
exports.DuplicateEntry = {"Error": [{Message:"Duplicate Entry given"}]};
exports.appDoesNotExist = {"Error": [{Message:"Given App Does Not exist"}]};
exports.ContentTypeMismatch = {"Error": [{Message:"Content-type Mismatch, Contet-Type should be application/json"}]};
exports.NoApps = {"data": [{Message:"No Apps Present"}]};
exports.Notables = {"data": [{Message:"There are no tables Associated with this app or given app does not exist"}]};
exports.appDeleted = {"data": [{Message:"APP DELETED Successfully"}]};
exports.Recordupdated = {"data": [{Message:"Record Updated"}]};
exports.RecordDeleted = {"data": [{Message:"Record Deleted"}]};
exports.appDeletionError =    {"Error": [{Message:"Error in deleting APP"}]};
exports.dropTableSuccess = {"data": [{Message: "Table Dropped Successfully"}]};
exports.TableDoesNotExist = {"Error": [{Message: "Table Does Not Exist"}]};

//log Messages
exports.InternalErrorLog = "Internal Error Occurred";
exports.ConnectionReleasedLog = "MYSQL Connection Released";
exports.DatabaseConnectionErrorLog = "Error Connecting To Database";
exports.ConnectionEstablishedLog = "MYSQL Connection Established";
exports.SuccessLog = "Operation Successful";
exports.MethodNotFoundLog = "Given URL not found or Requested Method For given URL not found";
exports.ContentTypeMismatchLog = "Content-type Mismatch, Content-Type should be application/json";


//JSON defining rest parameters

exports.index = {index :[{'/apps/metadata': {"type": "GET", "parameters": null, "function": "Lists All Running Apps"}},
    {'/[appName]/metadata': {"type": "GET", "parameters": null, "function": "Lists All tables associated with the App"}},
    {'/[appName]/[tableName]/metadata': {"type": "GET", "parameters": null, "function": "Gives the metadata of" +
                     "table specified in given app"}},
    {'/[appName]': {"type": "POST", "parameters": null, "function": "Creates new App with app Name"}},
    {'/[appName]/[tableName]': {"type": "POST", "parameters": "JSON data representing schema of table",
                                            "function": "Creates a table with the mentioned schema in the given app"}},
    {'/[appName]/[tableName]/insert': {"type": "POST", "parameters": "JSON data representing the data to be inserted",
                                                    "function": "Inserts a record into specified table in given app"}},
    {'/[appName]/[tableName]/fetch': {"type": "GET", "parameters": null, "function": "Fetched all the records in given table"}}]};

