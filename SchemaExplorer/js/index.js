var explorer = angular.module('SchemaExplorer',[]);

/* configuring get and post*/
explorer.config(function ($httpProvider) {
    //$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    // changing get
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
});

// Search for url parameter values
function getUrlParameters(name){
    if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search)){
        return decodeURIComponent(name[1]);
    }
}

// string end with function
String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};


// Gets all values associates with keys in an object

// Handel's the data from server and generates tables
function onSuccessDataHandler($scope, data){
    $scope.server_response_json = '';
    $scope.objKeys = [];
    $scope.innerObjKeys = [];
    if(data['data']!= undefined)
    {
        $scope.server_response_json = data['data'];
        if(typeof data['data'][0] == "object")
        {
            $scope.objKeys = Object.keys(data['data'][0]);
            if(typeof data['data'][0][$scope.objKeys[0]] == "object")
            {
                $scope.innerObjKeys = Object.keys(data['data'][0][$scope.objKeys[0]]);
            }
        }
    }
    else if(data['Error']!= undefined)
    {
        $scope.server_response_json = data['Error'];
        if(typeof data['Error'][0] == "object")
        {
            $scope.objKeys = Object.keys(data['Error'][0]);
        }
    }
    else
    {
        $scope.server_response_json = [{UnknownData:data}];
    }
}


// http get requests
function http_get($scope, $http){
    $http({
        method:'GET',
        url:$scope.reqUrl,
        data:''
    })
        .success(function(data){
            onSuccessDataHandler($scope, data);
        })
        .error(function(data){
            console.log("Error"+data)});
    $scope.reqUrl = '';
}


// http post requests
function http_post($scope,$http, onSuccessUrl)
{
    if(($scope.reqBody == undefined) || ($scope.reqBody == ''))
    {
        $scope.reqBody = '{}';
    }
    $http.post($scope.reqUrl, JSON.parse($scope.reqBody))
        .success(function(data){
            $scope.reqUrl = onSuccessUrl;
            http_get($scope, $http);
            if(data['data']!= undefined)
            {
                $scope.postStatus = "Added Successfully !";
            }
            else if(data['Error']!= undefined)
            {
                $scope.postStatus = data['Error'][0]['Message'];
            }
            $scope.reqBody = '';
        })
        .error(function(data){
            console.log('Error'+data);
            $scope.reqBody = '';
        });
}

function schemaExpController($scope, $http, $location){

    // init
    (function(){
        // Server url here
        $scope.server_url = 'http://localhost:3000/';

        $scope.currAppName = getUrlParameters('appName');
        $scope.currTableName = getUrlParameters('tableName');
        //Initial request url
        if($scope.currAppName == '' || $scope.currAppName== undefined)
        {
            if(!($location.absUrl().endsWith('appTables.html') || $location.absUrl().endsWith('tableDetails.html')))
            {
                $scope.currAppName = 'apps';
            }
        }
        if($scope.currTableName != undefined && $scope.currTableName !="")
        {
            $scope.reqUrl = $scope.server_url+$scope.currAppName+'/'+$scope.currTableName+'/metadata';
        }
        else
        {
            $scope.reqUrl = $scope.server_url+$scope.currAppName+'/metadata';
        }
        http_get($scope, $http);
    })();

    // resetting pages


    $scope.currUrl = function(){
      return $location.absUrl();
    };

    // http get method
    $scope.httpGet = function () {
        http_get($scope, $http);
    };

    //http post
    $scope.httpPost = function () {
        http_post($scope, $http);
    };

    // Adding new app
    $scope.addApp = function () {
        if ($scope.newAppName != undefined && $scope.newAppName != '') {
            $scope.reqUrl = $scope.server_url + $scope.newAppName;
            http_post($scope, $http, $scope.server_url + 'apps/metadata');
        }
        else {
            $scope.postStatus = "Please Provide an app name !";
        }
        $scope.newAppName = '';
        $scope.reqUrl = '';
    };

    // Deleting app
    $scope.deleteApp = function () {
        $http.delete($scope.server_url+$scope.newAppName)
            .success(function (data){
                $scope.postStatus = data['Error'][0]['Message'];
            })
            .error(function (data){
                $scope.postStatus = 'Error Occurred !' +
                    'Data : ' + data;
            });
    };

    // Add Table

    $scope.addTable = function () {
        if ($scope.currAppName != undefined
            && $scope.newTableName != undefined
            && $scope.columnName != undefined
            && $scope.columnType != undefined
            && $scope.columnType != "") {

            $scope.postStatus = '';
            $scope.reqUrl = $scope.server_url + $scope.currAppName + '/' + $scope.newTableName;
            var reqBody = JSON.parse('{"' + $scope.columnName + '":{"type":"' + $scope.columnType + '","key":"' + $scope.isKey + '","default":"' + $scope.defaultVal + '"}}');
            var successUrl = $scope.server_url + $scope.currAppName + '/metadata';
            // Sample input = {"columnName":{"type":"int","key":"True","default":1}}
            if (reqBody[$scope.columnName]['key'] == "undefined" || reqBody[$scope.columnName]['key'] == "") {
                delete reqBody[$scope.columnName]['key'];
            }
            if (reqBody[$scope.columnName]['default'] == "undefined" || reqBody[$scope.columnName]['default'] == "") {
                delete reqBody[$scope.columnName]['default'];
            }
            $scope.reqBody = JSON.stringify(reqBody);
            http_post($scope, $http, successUrl);
            $scope.columnName = ''; $scope.columnType = ''; $scope.isKey = false; $scope.newTableName = ''; $scope.defaultVal = '';
        }
        else {
            $scope.postStatus = 'Please Provide a valid table and app name !';
            console.log($scope.server_url + $scope.currAppName + '/' + $scope.newTableName);
        }

    };

    // Delete Table
    $scope.deleteTable = function(){
        $scope.postStatus = "Deleting Table...!";
    }
}