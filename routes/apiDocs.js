/*This file contains JSON objects which correspond to swagger specification
* which is used to generate the documentation for the rest server*/
var constants = require('./constants');

var createAppinfo = "We need to send schema of the table. The content-type of body is application/json. An example schema<br/>" +
    '<h6>{"columnName1" : {"type" : "int", "properties" : ["auto_increment"], "key" : true}}</h6><br/>' +
    'We can describle multiple columns at the same time as follows. <br/><br/>' +
    '<h6>{"columnName1" : {"type" : "int", "properties" : ["auto_increment"], "key" : true}, "columnName2" : {"type" : "varchar(20)", "properties" : ["unique"], "key" : true}}</h6><br/>' +
    'The other options for the schema are described below';


exports.api = {
    "apiVersion" : "1.0",
    "swaggerVersion" : "1.3.0",
    "apis" : [
        {
            "path" : "/metadataDocs",
            "description" : "Gives Information about Apps and tables and their metadata"
        },
        {
            "path" : "/appOperationsDocs",
            "description" : "Gives Information about operations performed on Apps"
        },
        {
            "path" : "/appTableOperationsDocs",
            "description" : "Gives Information about operations performed on App Tables"
        }
    ],
    "info":{
        "title":"Table as a Service Rest Server",
        "description":"Describes the Rest calls for the Rest Server<br/><br/><br/><br/>"
    }

};

exports.metadata = {
    "apiVersion" : "1.0",
    "swaggerVersion" : "1.3.0",
    "basePath" : constants.URL,
    "resourcePath" : "/metadataDocs",
    "produces":[
        "application/json"
    ],
    "apis" : [
        {
            "path" : "/apps/metadata",
            "operations" : [
                {
                    "method" : "GET",
                    "nickname" : "getApps",
                    "summary" : "Gives You all the Running Apps",
                    "notes" : "All the apps which are created using the REST server"

                }
            ]
        },
        {
            "path" : "/{appName}/metadata",
            "operations" : [
                {
                    "method" : "GET",
                    "nickname" : "getTablesWithApp",
                    "summary" : "Gives You All Tables associated With the app",
                    "parameters" : [
                        {
                            "paramType" : "path",
                            "name" : "appName",
                            "description" : "The App name for which the tables needs to be fetched",
                            "dataType" : "string",
                            "required" : true
                        }
                    ]
                }
            ]
        },
        {
            "path" : "/{appName}/{tableName}/metadata",
            "operations" : [
                {
                    "method" : "GET",
                    "nickname" : "getMetadataOfTables",
                    "summary" : "Gives Metadata of Tables",
                    "parameters" : [
                        {
                            "paramType" : "path",
                            "name" : "appName",
                            "description" : "App name for which the metadata need to be fetched",
                            "dataType" : "string",
                            "required" : true
                        },
                        {
                            "paramType" : "path",
                            "name" : "tableName",
                            "description" : "Table name for which the metadata need to be fetched",
                            "dataType" : "string",
                            "required" : true
                        }
                    ]
                }
            ]
        }
    ]
};

exports.appOperations = {
    "apiVersion" : "1.0",
    "swaggerVersion" : "1.3.0",
    "basePath" : constants.URL,
    "resourcePath" : "/appOperationsDocs",
    "produces":[
        "application/json"
    ],
    "apis" : [
        {
            "path" : "/{appName}",
            "operations" : [
                {
                    "method" : "POST",
                    "nickname" : "createApp",
                    "summary" : "Creating an App with the Specified Name",
                    "parameters" : [
                        {
                            "paramType" : "path",
                            "name" : "appName",
                            "description" : "App name to be created",
                            "dataType" : "string",
                            "required" : true
                        }
                    ]

                }
            ]
        },
        {
            "path" : "/{appName}",
            "operations" : [
                {
                    "method" : "DELETE",
                    "nickname" : "deleteApp",
                    "summary" : "Deletes The App",
                    "parameters" : [
                        {
                            "paramType" : "path",
                            "name" : "appName",
                            "description" : "The App name for which the tables needs to be fetched",
                            "dataType" : "string",
                            "required" : true
                        }
                    ]
                }
            ]
        }
    ]
};


exports.appTableOperations = {
    "apiVersion" : "1.0",
    "swaggerVersion" : "1.3.0",
    "basePath" : constants.URL,
    "resourcePath" : "/appTableOperations",
    "produces":[
        "application/json"
    ],
    "apis" : [
        {
            "path" : "/{appName}/{tableName}",
            "operations" : [
                {
                    "method" : "POST",
                    "nickname" : "createTableInApp",
                    "summary" : "Create a table with the specified schema",
                    "notes" : createAppinfo,
                    "type" : "column",
                    "parameters" : [
                        {
                            "paramType" : "path",
                            "name" : "appName",
                            "description" : "The App name in which table need to be created",
                            "dataType" : "string",
                            "required" : true
                        },
                        {
                            "paramType" : "path",
                            "name" : "tableName",
                            "description" : "The Table Name to be Created",
                            "dataType" : "string",
                            "required" : true
                        }
                    ]
                }
            ]
        },
        {
            "path" : "/{appName}/{tableName}",
            "operations" : [
                {
                    "method" : "DELETE",
                    "nickname" : "deleteTablesWithApp",
                    "summary" : "Deletes the Table associated With the app",
                    "parameters" : [
                        {
                            "paramType" : "path",
                            "name" : "appName",
                            "description" : "The App name for which the tables needs to be deleted",
                            "dataType" : "string",
                            "required" : true
                        },
                        {
                            "paramType" : "path",
                            "name" : "tableName",
                            "description" : "The Table Name to be Deleted",
                            "dataType" : "string",
                            "required" : true
                        }
                    ]
                }
            ]
        },
        {
            "path" : "/{appName}/{tableName}/fetch",
            "operations" : [
                {
                    "method" : "GET",
                    "nickname" : "getRecordsFromTable",
                    "summary" : "Fetch The records from specified table in app",
                    "parameters" : [
                        {
                            "paramType" : "path",
                            "name" : "appName",
                            "description" : "App name for which the records in table need to be fetched",
                            "dataType" : "string",
                            "required" : true
                        },
                        {
                            "paramType" : "path",
                            "name" : "tableName",
                            "description" : "Table name for which the records need to be fetched",
                            "dataType" : "string",
                            "required" : true
                        },
                        {
                            "paramType" : "query",
                            "name" : "filter",
                            "description" : "The fields in the table to be retrieved",
                            "dataType" : "string",
                            "required" : false
                        },
                        {
                            "paramType" : "query",
                            "name" : "where",
                            "description" : "Describe the where condition here",
                            "dataType" : "string",
                            "required" : false
                        },
                        {
                            "paramType" : "query",
                            "name" : "orderby",
                            "description" : "orderby Clause Description",
                            "dataType" : "string",
                            "required" : false
                        },
                        {
                            "paramType" : "query",
                            "name" : "groupby",
                            "description" : "groupby clause Description",
                            "dataType" : "string",
                            "required" : false
                        },
                        {
                            "paramType" : "query",
                            "name" : "limit",
                            "description" : "Limit gives the number of records to be retrieved",
                            "dataType" : "string",
                            "required" : false
                        }
                    ]
                }
            ]
        },
        {
            "path" : "/{appName}/{tableName}/insert",
            "operations" : [
                {
                    "method" : "POST",
                    "nickname" : "insertRecordsIntoTable",
                    "summary" : "Insert records to specified table in app",
                    "type" : "columnName",
                    "parameters" : [
                        {
                            "paramType" : "path",
                            "name" : "appName",
                            "description" : "App name for which the records in table need to be inserted",
                            "dataType" : "string",
                            "required" : true
                        },
                        {
                            "paramType" : "path",
                            "name" : "tableName",
                            "description" : "Table name for which the records need to be inserted",
                            "dataType" : "string",
                            "required" : true
                        }
                    ]
                }
            ]
        },
        {
            "path" : "/{appName}/{tableName}/delete",
            "operations" : [
                {
                    "method" : "DELETE",
                    "nickname" : "deleteRecordsFromTable",
                    "summary" : "Delete records from specified table in app",
                    "parameters" : [
                        {
                            "paramType" : "path",
                            "name" : "appName",
                            "description" : "App name for which the records in table need to be deleted",
                            "dataType" : "string",
                            "required" : true
                        },
                        {
                            "paramType" : "path",
                            "name" : "tableName",
                            "description" : "Table name for which the records need to be deleted",
                            "dataType" : "string",
                            "required" : true
                        },
                        {
                            "paramType" : "query",
                            "name" : "where",
                            "description" : "Describe the where condition here",
                            "dataType" : "string",
                            "required" : false
                        },
                        {
                            "paramType" : "query",
                            "name" : "orderby",
                            "description" : "orderby Clause Description",
                            "dataType" : "string",
                            "required" : false
                        },
                        {
                            "paramType" : "query",
                            "name" : "limit",
                            "description" : "Limit gives the number of records to be Deleted",
                            "dataType" : "string",
                            "required" : false
                        }
                    ]
                }
            ]
        },
        {
            "path" : "/{appName}/{tableName}/update",
            "operations" : [
                {
                    "method" : "PUT",
                    "nickname" : "updateRecordsInTable",
                    "summary" : "Update records in specified table in app",
                    "type" : "columnName",
                    "parameters" : [
                        {
                            "paramType" : "path",
                            "name" : "appName",
                            "description" : "App name for which the records in table need to be deleted",
                            "dataType" : "string",
                            "required" : true
                        },
                        {
                            "paramType" : "path",
                            "name" : "tableName",
                            "description" : "Table name for which the records need to be deleted",
                            "dataType" : "string",
                            "required" : true
                        }
                    ]
                }
            ]
        }

    ],
    "models" : {
        "column" : {
            "id" : "column",
            "required" : ["type"],
            "properties" : {
                "type" : {
                    "type" : "string",
                    "description" : "Column Name type field, Ex: varchar(30)"
                },
                "properties" : {
                    "type" : "array",
                    "items" : {
                        "$ref": "string"
                    },
                    "description" : "Properties of the column, Ex: auto_increment, not null"
                },
                "default" : {
                    "type" : "string",
                    "description" : "Default Value to be Assigned to the Column"
                },
                "key" : {
                    "type" : "boolean",
                    "description" : "If true it is a primary key"
                },
                "references" : {
                    "$ref" : "foreignKey",
                    "description" : "To define Foreign Key Relationships"
                }
            }
        },
        "foreignKey" : {
            "id" : "foreignKey",
            "required" : ["entity", "column"],
            "properties": {
                "entity" : {
                    "type" : "string",
                    "description" : ""
                },
                "column" : {
                    "type" : "string",
                    "description" : ""
                }
            }
        },
        "columnName" : {
            "id" : "columnName",
            "required" : ["columnValue"],
            "properties" : {
                "columnValue(string)" : {
                    "type" : "string",
                    "description" : "Value associated with the given column if it is a string"
                },
                "columnValue(integer)" : {
                    "type" : "integer",
                    "description" : "Value associated with the given column if it is a integer"
                }
            }
        }
    }
};
