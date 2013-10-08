/**
 * Created with JetBrains WebStorm.
 * User: vineeth
 * Date: 10/7/13
 * Time: 9:25 PM
 * To change this template use File | Settings | File Templates.
 */

//dependencies
var mysql = require('mysql');

var DBHOST = "mysqltestdbinstance.chdy3grdylcm.ap-southeast-1.rds.amazonaws.com";
var DBUSERNAME = "vineethguna";
var DBPASSWORD = "vineethguna";
var DBPORT = "3306";
var DATABASE = 'testdb';


exports.pool = mysql.createPool({
    host : DBHOST,
    password : DBPASSWORD,
    user : DBUSERNAME,
    port : DBPORT ,
    database : DATABASE ,
    multipleStatements: true
});


//error handler
exports.ErrorHandler = function(res, err){
    var errorCode = err.code;
    if(errorCode == 'PROTOCOL_CONNECTION_LOST'){
        res.json({"Error": "Connection Lost to Mysql Server"});
    }
    else if(errorCode == 'ER_ACCESS_DENIED_ERROR'){
        res.json({"Error": "Access Denied"});
    }
    else if(errorCode == 'ER_CANT_CREATE_TABLE'){
        res.json({"Error": "Cannot Create Table"});
    }
    else if(errorCode == 'ER_CANT_CREATE_DB'){
        res.json({"Error": "Error creating Database"});
    }
    else if(errorCode == 'ER_TABLE_EXISTS_ERROR'){
        res.json({"Error": "TABLE Already Exists"});
    }
    else if(errorCode == 'ER_PARSE_ERROR'){
        res.json({"Error": "Error in given Parameters"});
    }
    else if(errorCode == 'ER_DUP_ENTRY'){
        res.json({"Error": "Duplicate Entry Given"});
    }
    else{
        res.json({"Error": "Unknown SQL error"});
    }

}



//error codes
exports.SQL_PARSE_ERROR = 'ER_PARSE_ERROR';