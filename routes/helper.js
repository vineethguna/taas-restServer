var util = require('util');
var queryGenerator = require('./queryGenerator');

exports.checkForNullValues = function(list){
    if(list != null){
        for(var item in list){
            if(item == null){
                return false;
            }
        }
        return true;
    }
    return false;
}

exports.returnFieldsAndFieldValues = function(json_object){
    var fields = [];
    var fieldValues = [];
    if(json_object != null)
    {
        for(var key in json_object){
            fields.push(key);
            fieldValues.push(json_object[key]);
        }
    }
    return [fields, fieldValues];
}

exports.generateSchemaFromModelDef = function(modelDef){
    if(modelDef != null){
        var primarykeyFields = [], foreignKeyFields = [], typeFields = [];
        var primaryKeySkeleton = "PRIMARY KEY (%s)";
        for(var field in modelDef){
            var type = modelDef[field]["type"];
            var properties = modelDef[field]["properties"];
            var defaultValue = modelDef[field]["default"];
            var tempString = handleTypeAndProperties(field, type, properties, defaultValue);
            if(tempString != null){
                typeFields.push(tempString);
            }
            else{
                return null;
            }
            handlePrimaryKey(field, modelDef[field]["key"], primarykeyFields);
            if(!handleForeignKey(field, modelDef[field]["references"], foreignKeyFields)){
                return null;
            }
        }
        var schema = [typeFields.join(", ")];
        if(primarykeyFields.length > 0){
            schema.push(util.format(primaryKeySkeleton, primarykeyFields.join(", ")));
        }
        if(foreignKeyFields.length > 0){
            schema.push(foreignKeyFields.join(", "));
        }
        return schema.join(", ");
    }
    return null;
}

function handleTypeAndProperties(field, type, properties, defaultValue){
    var tempString = '';
    if(type != null){
        tempString += [field, type].join(' ');
    }
    else{
        return null;
    }
    if(properties != null){
        if(Array.isArray(properties)){
            tempString += ' ' + properties.join(' ');
        }
        else{
            return null;
        }
    }
    if(defaultValue != null && typeof defaultValue == 'number'){
        tempString += ' DEFAULT ' + defaultValue;
    }
    else{
        tempString += " DEFAULT '" + defaultValue + "'";
    }
    return tempString;
}

function handlePrimaryKey(field, isPrimaryKey, list){
    if(isPrimaryKey){
        list.push(field);
    }
}

function handleForeignKey(field, references, list){
    var foreignKeySkeleton = "FOREIGN KEY (%s) REFERENCES %s(%s) ON DELETE CASCADE";
    if(references != null){
        var entity = references["entity"];
        var column = references["column"];
        if(entity != null && column != null){
            list.push(util.format(foreignKeySkeleton, field, entity, column));
            return true;
        }
        else{
            return false;
        }
    }
    return true;
}

exports.getFieldInfoForMetaDataTable = function(appId, tableName, fieldsData){
    var fieldsMetadata = [];
    for(var field in fieldsData){
        var type = fieldsData[field]["type"];
        var isRequired = false;
        var defaultValue = fieldsData[field]["default"];
        if(fieldsData[field]["key"] || inArray(fieldsData[field]["properties"], "not null")){//edit required
            isRequired = true;
        }
        fieldsMetadata.push([appId, tableName, field, isRequired, type,  defaultValue]);
    }
    return fieldsMetadata;
}

function inArray(array, element){
    if(array != null){
        for(var index=0; index < array.length; index++){
            if(array[index].toLowerCase() == element){
                return true;
            }
        }
        return false;
    }
    return false;
}


exports.processJoinData = function(conn, appID, joinData){
    if(joinData != null && joinData.relation1 != null){
        var relation1 = appID + '_' + joinData.relation1;
        var relation2 = handleNestedJoins(appID, joinData.relation2);
        var joinString = queryGenerator.JoinQuery(joinData.type, relation1, relation2, joinData.on, joinData.using);
        if(joinData.query.toLowerCase() == 'select'){
            return queryGenerator.SelectTableQuery(conn, joinString, joinData.fields, joinData.where, joinData.orderBy,
                                                    joinData.groupBy, joinData.limit);
        }
        else{
            return queryGenerator.DeleteRecordQuery(joinString, joinData.where, join.orderBy, join.limit);
        }
    }
    return '';
}

function handleNestedJoins(appID, relation2){
    var joinString;
    var stack = [];
    while(relation2 != null && typeof relation2 != 'string'){
        stack.push(relation2.relation1);
        var temp = {"type": relation2.type, "on": relation2.on, "using": relation2.using};
        stack.push(temp);
        relation2 = relation2.relation2;
    }
    if(relation2!=null){
        stack.push(appID + '_' + relation2);
    }
    else{
        stack.push('');
    }
    if(stack.length >= 3){
        while(true){
            var op2 = stack.pop();
            var op = stack.pop();
            var op1 = appID + '_' + stack.pop();
            if(op2 != null && op!=null && op1 != null){
                stack.push(queryGenerator.JoinQuery(op.type, op1, op2, op.on, op.using));
            }
            else{
                break;
            }
        }
    }
    joinString = stack.pop();
    /*if(relation2 != null && typeof relation2 != 'string'){

    }
    else{
        joinString += relation2;
    }*/
    return joinString;
}