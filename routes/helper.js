var util = require('util');

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
    for(var key in json_object){
        fields.push(key);
        fieldValues.push(json_object[key]);
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
