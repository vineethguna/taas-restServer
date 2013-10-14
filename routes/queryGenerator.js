/**
 * Created with JetBrains WebStorm.
 * User: vineeth
 * Date: 10/4/13
 * Time: 7:48 PM
 * To change this template use File | Settings | File Templates.
 */

//dependencies
var util = require('util');
var constants = require('./constants');
var logger = require('./logger');

//skeletons for queries
var CREATE_TABLE_SKELETON = "CREATE TABLE %s (%s)";
var DROP_TABLE_SKELETON = "DROP TABLE IF EXISTS %s";
var INSERT_RECORD_SKELETON = "INSERT INTO %s(%s) VALUES(%s)";
var INSERT_MULTIPLE_RECORD_SKELETON = "INSERT INTO %s(%s) VALUES %s";
var COUNT_SKELETON = "SELECT COUNT(*) FROM %s";
var UPDATE_BASE_SKELETON = "UPDATE %s SET %s WHERE %s;";
var DELETE_BASE_SKELETON = "DELETE FROM %s %s;";
var SELECT_SKELETON = "SELECT %s FROM %s %s";


//creates query for table creation based on parameters given
exports.CreateTableQuery = function(tableName, schema){
    if(typeof tableName == 'string' && typeof schema == 'string'){
        var query = util.format(CREATE_TABLE_SKELETON, tableName, schema);
        logger.log('info', "CREATE QUERY: " + query);
        return query;
    }
    else{
        return '';
    }
}


//creates query for dropping a table based on parameters given
exports.DropTableQuery = function(tableName){
     if(typeof tableName == 'string'){
        var query = util.format(DROP_TABLE_SKELETON, tableName);
         logger.log('info', "DROP QUERY: " + query);
        return query;
     }
     return '';
}

//creates query for altering properties of table based on parameters given
exports.AlterTableQuery = function(){

}


//creates query for select based on parameters given
exports.SelectTableQuery = function(conn, tableName, fields, where, orderByClause, groupByClause, Limit, nestedQuery){
    var fieldsString = '', extensionString;
    if(fields != null){
        fieldsString = fields;
    }
    else{
        fieldsString = '*';
    }
    extensionString = handleSqlConditions(where, orderByClause, Limit, groupByClause);
    if(nestedQuery != null){
        extensionString += ' IN (' + nestedQuery + ')';
    }
    var query = util.format(SELECT_SKELETON, fieldsString, tableName, extensionString);
    logger.log('info', "(SELECT QUERY): " + query);
    return query;
}


//creates query for inserting a record into table based on parameters given
exports.InsertRecordQuery = function(conn, tableName, fields, fieldValues){
    var query = '';
    if(conn != null){
        var fieldsString = convertListToString(fields, ", ");
        var fieldValuesString = convertListToDBString(conn, fieldValues, ", ");
        query = util.format(INSERT_RECORD_SKELETON, tableName, fieldsString, fieldValuesString);
    }
    logger.log('info', "(INSERT QUERY): " + query);
    return query;
}


//creates query for inserting multiple records into table based on parameters given
exports.InsertMultipleRecordQuery = function(conn, tableName, fields, mulFieldValues){
    var query = '';
    if(conn != null){
        var fieldValuesList = [];
        var fieldsString = convertListToString(fields, ", ");
        for(var index = 0; index < mulFieldValues.length; index++){
            fieldValuesList.push('(' + convertListToDBString(conn, mulFieldValues[index], ", ") + ')');
        }
        fieldValuesList = fieldValuesList.join(', ');
        query = util.format(INSERT_MULTIPLE_RECORD_SKELETON, tableName, fieldsString, fieldValuesList);
    }
    logger.log('info', "(INSERT QUERY): " + query);
    return query;
}


//creates query for deleting a record in table based on parameters given
exports.DeleteRecordQuery = function(tableName, where, orderByClause, limit){
    var query = '';
    if(tableName != null){
        var extensionString;
        extensionString = handleSqlConditions(where, orderByClause, limit, null);
        query = util.format(DELETE_BASE_SKELETON, tableName, extensionString);
    }
    logger.log('info', "(DELETE QUERY): " + query);
    return query;
}

//creates query for updating a record  in table based on parameters given
exports.UpdateRecordQuery = function(tableName, setData, where, orderByClause, limit){
    var query = '';
    if(tableName != null && setData != null){
        var  extensionString, setString;
        setString = handleSETCondition(setData);
        extensionString = handleSqlConditions(where, orderByClause, limit, null);
        query = util.format(UPDATE_BASE_SKELETON, tableName, setString, extensionString);
    }
    logger.log('info', "(UPDATE QUERY): " + query);
    return query;
}

exports.CountQuery = function(tableName){
    var query = '';
    if(tableName != null){
        query = util.format(COUNT_SKELETON, tableName);
    }
    logger.log('info', "(COUNT QUERY): " + query);
    return query;
}



//helper functions

function convertListToDBString(conn, list, seperator){
    if(list != null){
        for(var i=0; i < list.length; i++){
            list[i] =  conn.escape(list[i]);
        }
        return list.join(seperator);
    }
    return null;
}

function convertListToString(list, seperator){
    if(list != null){
        return list.join(seperator);
    }
    return null;
}

function handleWhereCondition(where){
    if(where != null){
        var temp, whereString = '';
        temp = where.split(' ');
        for(var index=0; index < temp.length; index++){
            if(temp[index] != ''){
                whereString += processString(temp[index]);
            }
        }
        return whereString;
    }
    return '';
}

function processString(string){
    if(string == "eq"){
        return ' = ';
    }
    else if(string == "ne"){
        return ' != ';
    }
    else if(string == "gt"){
        return " > ";
    }
    else if(string == "ge"){
        return " >= ";
    }
    else if(string == "lt"){
        return " < ";
    }
    else if(string == "le"){
        return " <= ";
    }
    else{
        return ' ' + string;
    }
}

function handleSETCondition(setData){
    if(setData != null){
        var setDataList = [];
        for(var key in setData){
            setDataList.push(key + " = " + setData[key]);
        }
        return setDataList.join(", ");
    }
    return '';
}

function handleSqlConditions(where, orderByClause, limit, groupByClause){
    var extensionString = '';
    if(where != null){
        extensionString += ' WHERE ' + handleWhereCondition(where);
    }
    if(orderByClause != null){
        extensionString  += ' ORDER BY ' + orderByClause;
    }
    if(groupByClause != null){
        extensionString += ' GROUP BY ' + groupByClause;
    }
    if(limit != null){
        extensionString += ' LIMIT ' + conn.escape(Limit);
    }
    return extensionString;
}