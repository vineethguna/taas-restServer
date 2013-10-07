/**
 * Created with JetBrains WebStorm.
 * User: vineeth
 * Date: 10/7/13
 * Time: 8:06 AM
 * To change this template use File | Settings | File Templates.
 */

var util = require('util');
var constants = require('./constants');


var modelDef = {"id": {"type": "int", "properties": ["auto_increment"], "key": true},
                "name": {"type": "varchar(40)", "properties": ["unique", "not null"]}
               }

function generateSchemaFromModelDef(modelDef){
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
        return [typeFields.join(", ") , util.format(primaryKeySkeleton, primarykeyFields.join(", ")) ,
                 foreignKeyFields.join(", ")].join(", ");
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
        if(true){
            tempString += ' ' + properties.join(' ');
        }
        else{
            return null;
        }
    }
    if(defaultValue != null){
        tempString += ' DEFAULT ' + defaultValue;
    }
    return tempString;
}

function handlePrimaryKey(field, isPrimaryKey, list){
    if(isPrimaryKey){
        list.push(field);
    }
}

function handleForeignKey(field, references, list){
    var foreignKeySkeleton = "FOREIGN KEY (%s) REFERENCES %s(%s)";
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

var b = generateSchemaFromModelDef(modelDef);
console.log(b);