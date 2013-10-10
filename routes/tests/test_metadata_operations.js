
var request = require('request');

exports.testGetAllRunningApps = function(test){
    var url = "http://localhost:3000/apps/metadata";
    request.get(url, function(error, res, body){
        body = JSON.parse(body);
        var data = body["data"];
        if(typeof data == 'string'){
            test.equal(data, "No Apps Present");
        }
        else if(typeof data == "undefined"){
            test.ok(false, "Error occured");
        }
        else{
            for(var i=0; i < data.length; i++){
                var typeofid = typeof data[i]["id"];
                var typeofname = typeof data[i]["name"];
                test.equal(typeofid, "number");
                test.equal(typeofname, "string");
            }
        }
        test.done();
    });
}

exports.testGetMetadataOfExistingAppWithTables = function(test){
    var existingAppName = 'testinApp';
    var url = "http://localhost:3000/" + existingAppName + "/metadata";
    request.get(url, function(error, response, body){
        body = JSON.parse(body);
        var data = body["data"];
        if(Object.prototype.toString.call(data) == '[object Array]'){
            for(var i=0; i < data.length; i++){
                var appID = data[i]["appID"];
                var tableName = data[i]["tableName"];
                test.equal(typeof appID,'number');
                test.equal(typeof tableName, 'string');
            }
        }
        else{
            test.ok(false, "Object type does not match");
        }
        test.done();
    });

};


exports.testGetMetadataOfExistingAppWithoutTables = function(test){
    var existingAppName = 'q2r2C';
    var url = "http://localhost:3000/" + existingAppName + "/metadata";
    request.get(url, function(error, response, body){
        body = JSON.parse(body);
        var data = body["data"];
        if(typeof data == 'string'){
            test.equal(data, "There are no tables Associated with this app or given app does not exist");
        }
        else{
            test.ok(false, "Object type does not match");
        }
        test.done();
    });
};

exports.testGetMetadataOfNonExistingApp = function(test){
    var nonExistingAppName = 'fsjkhfse';
    var url = "http://localhost:3000/" + nonExistingAppName + "/metadata";
    request.get(url, function(error, response, body){
        body = JSON.parse(body);
        var data = body["data"];
        if(typeof data == 'string'){
            test.equal(data, "There are no tables Associated with this app or given app does not exist");
        }
        else{
            test.ok(false, "Object type does not match");
        }
        test.done();
    });
};

exports.testGetMetadataOfAppTables = function(test){
    var url = "http://localhost:3000/testinApp/testTable/metadata";
    request.get(url, function(error, response, body){
        body = JSON.parse(body);
        var data = body["data"];
        if(Object.prototype.toString.call(data) == '[object Array]'){
            for(var i=0; i < data.length; i++){
                var appID = data[i]["appID"];
                var tableName = data[i]["tableName"];
                var fieldName = data[i] ["fieldName"];
                var isRequired = data[i]["isRequired"];
                var fieldType = data[i]["fieldType"];
                var defaultValue = data[i]["defaultValue"];
                test.equal(typeof appID, 'number');
                test.equal(typeof tableName, 'string');
                test.equal(typeof fieldName, 'string');
                if(isRequired == 0 || isRequired == 1){
                    test.equal(typeof isRequired, 'number');
                }
                else{
                    test.equal(false, "isRequired field has error");
                }
                test.equal(typeof fieldType, "string");
                if(defaultValue == null){
                    test.equal(defaultValue, null);
                }
                else{
                    test.equal(typeof defaultValue, 'object');
                }
            }
        }
        else{
            test.ok(false, "Object type does not match");
        }
        test.done();
    });
};