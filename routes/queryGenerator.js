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


//skeletons for queries
var CREATE_TABLE_SKELETON = "CREATE TABLE %s (%s)";
var DROP_TABLE_SKELETON = "DROP TABLE IF EXISTS %s";
var INSERT_RECORD_SKELETON = "INSERT INTO %s(%s) VALUES(%s)";
var INSERT_MULTIPLE_RECORD_SKELETON = "INSERT INTO %s(%s) VALUES %s";
var COUNT_SKELETON = "SELECT COUNT(*) FROM %s";
//UPDATE_BASE_QUERY = "UPDATE %s SET %s WHERE %s;"
//DELETE_BASE_QUERY = "DELETE FROM %s WHERE %s;"
var SELECT_SKELETON = "SELECT %s FROM %s %s";


//creates query for table creation based on parameters given
exports.CreateTableQuery = function(tableName, schema){
    if(typeof tableName == 'string' && typeof schema == 'string'){
        var query = util.format(CREATE_TABLE_SKELETON, tableName, schema);
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
         return query;
     }
     return '';
}

//creates query for altering properties of table based on parameters given
exports.AlterTableQuery = function(){

}


//creates query for select based on parameters given
exports.SelectTableQuery = function(conn, tableName, fields, where, orderByClause, groupByClause, Limit, nestedQuery){
    var fieldsString = '', extensionString = '';
    if(fields != null){
        fieldsString = fields;
    }
    else{
        fieldsString = '*';
    }
    if(where != null){
        extensionString += ' WHERE ' + handleWhereCondition(where);
    }
    if(orderByClause != null){
        extensionString  += ' ORDER BY ' + orderByClause;
    }
    if(groupByClause != null){
        extensionString += ' GROUP BY ' + groupByClause;
    }
    if(Limit != null){
        extensionString += ' LIMIT ' + conn.escape(Limit);
    }
    if(nestedQuery != null){
        extensionString += ' IN (' + nestedQuery + ')';
    }
    return util.format(SELECT_SKELETON, fieldsString, tableName, extensionString);
}


//creates query for inserting a record into table based on parameters given
exports.InsertRecordQuery = function(conn, tableName, fields, fieldValues){
    if(conn != null){
        var fieldsString = convertListToString(fields, ", ");
        var fieldValuesString = convertListToDBString(conn, fieldValues, ", ");
        return util.format(INSERT_RECORD_SKELETON, tableName, fieldsString, fieldValuesString);
    }
    return '';
}


//creates query for inserting multiple records into table based on parameters given
exports.InsertMultipleRecordQuery = function(conn, tableName, fields, mulFieldValues){
    if(conn != null){
        var fieldValuesList = [];
        var fieldsString = convertListToString(fields, ", ");
        for(var index = 0; index < mulFieldValues.length; index++){
            fieldValuesList.push('(' + convertListToDBString(conn, mulFieldValues[index], ", ") + ')');
        }
        fieldValuesList = fieldValuesList.join(', ');
        return util.format(INSERT_MULTIPLE_RECORD_SKELETON, tableName, fieldsString, fieldValuesList);
    }
    return '';
}


//creates query for deleting a record in table based on parameters given
exports.DeleteRecordQuery = function(){

}

//creates query for updating a record  in table based on parameters given

exports.UpdateRecordQuery = function(){

}

exports.CountQuery = function(tableName){
    if(tableName != null){
        return util.format(COUNT_SKELETON, tableName);
    }
    return '';
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