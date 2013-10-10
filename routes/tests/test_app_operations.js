/* tests are checked using nodeunit library *

    To run tests type -  nodeunit <test_file_name>
    in terminal or command prompt
 */

var request = require('request');

var appName = generateRandomString();

exports.testCreateNewApp = function(test){
    //test data to send
    var url = "http://localhost:3000/" + appName;
    request.post(url, function(error, res, body){
        body = JSON.parse(body);
        test.equal(res.statusCode, "200");
        var id = body["id"], name = body["name"];
        test.notEqual(id, null, "id verified");
        test.equal(name, appName, "APP name verified");
        test.done();
    });
};

exports.testCreateAppWithNameApps = function(test){
    request.post("http://localhost:3000/apps", function(error, res, body){
        body = JSON.parse(body);
        var err = body["Error"];
        test.equal(res.statusCode, "200");
        test.notEqual(err, null);
        test.done();
    });
};

exports.testCreateAppWhichExists = function(test){
    var url = "http://localhost:3000/" + appName;
    request.post(url, function(error, res, body){
        body = JSON.parse(body);
        var err = body["Error"];
        test.equal(res.statusCode, "200");
        test.notEqual(err, null);
        test.done();
    });
};


function generateRandomString()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}