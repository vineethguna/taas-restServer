/**
 * Created with JetBrains WebStorm.
 * User: vineeth
 * Date: 10/7/13
 * Time: 9:25 PM
 * To change this template use File | Settings | File Templates.
 */

//dependencies
var mysql = require('mysql');

var DBHOST = "localhost"; //"mysqltestdbinstance.chdy3grdylcm.ap-southeast-1.rds.amazonaws.com";
var DBUSERNAME = "root";
var DBPASSWORD = "root";
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