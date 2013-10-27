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
                $scope.reqStatus = "Added Successfully !";
            }
            else if(data['Error']!= undefined)
            {
                $scope.reqStatus = data['Error'][0]['Message'];
            }
            $scope.reqBody = '';
        })
        .error(function(data){
            console.log('Error'+data);
            $scope.reqBody = '';
        });
}



// Adding new app
function add_new_app($scope, $http){
    if ($scope.newAppName != undefined && $scope.newAppName != '') {
        $scope.reqUrl = $scope.server_url + $scope.newAppName;
        http_post($scope, $http, $scope.server_url + 'apps/metadata');
    }
    else {
        $scope.reqStatus = "Please Provide an app name !";
    }
    $scope.newAppName = '';
    $scope.reqUrl = '';
}



// Deleting app
function delete_app($scope,$http) {
    if($scope.newAppName != '""' && $scope.newAppName != "''" && $scope.newAppName != undefined)
    {
        $http.delete($scope.server_url+$scope.newAppName)
            .success(function (data){
                if(data['data'] != undefined)
                {
                    $scope.reqUrl = $scope.server_url+"apps/metadata";
                    http_get($scope, $http);
                    $scope.reqStatus = "Delete Successful !"
                }
                else if(data['Error'] != undefined)
                {
                    $scope.reqStatus = data['Error'][0]['Message'];
                }
            })
            .error(function (data){
                $scope.reqStatus = 'Error Occurred !' +
                    'Data : ' + data;
            });
    }
    else
    {
        $scope.reqStatus = "Please Provide a valid App Name !";
    }
    $scope.reqUrl = '';
}



// Adding a table
function add_table($scope,$http){
    $scope.reqStatus = '';
    var reqObjArray = $scope.colIndex;
    if ($scope.currAppName != undefined     && $scope.currAppName != '""'   && $scope.currAppName != "''"
        && $scope.newTableName != undefined && $scope.currTableName != '""' && $scope.currTableName != "''")
    {
        $scope.reqUrl = $scope.server_url + $scope.currAppName + '/' + $scope.newTableName;
        var successUrl = $scope.server_url + $scope.currAppName + '/metadata';
        var validityCheck = true;
        // Checking request objects
        for(var i = reqObjArray.length-1; i >= 0; i--){
            if(reqObjArray[i]['columnName'] == '' || reqObjArray[i]['columnName'].indexOf('"') >= 0 || reqObjArray[i]['columnName'].indexOf("'") >= 0
            || reqObjArray[i]['columnType'] == '' || reqObjArray[i]['columnType'].indexOf('"') >= 0 || reqObjArray[i]['columnType'].indexOf("'") >= 0){
                $scope.reqStatus = "Please Provide valid details in row "+ i;
                validityCheck = false;
                break;
            }
        }
        if(validityCheck)
        {
            $scope.reqBody = JSON.stringify(reqObjArray);
            http_post($scope, $http, successUrl);
            console.log($scope.colIndex);
            $scope.noOfCols = undefined;
        }
    }
    else
    {
            $scope.reqStatus = 'Please Provide a valid table and app name !';
            multiReq = [];
            console.log($scope.server_url + $scope.currAppName + '/' + $scope.newTableName);
    }
    console.log($scope.colIndex);
    $scope.reqUrl = '';
}



// Deleting table
function delete_table($scope, $http){
    if($scope.newTableName !='""' && $scope.newTableName != undefined && $scope.newTableName !="''")
    {
        $http.delete($scope.server_url+$scope.currAppName+'/'+$scope.newTableName)
            .success(function (data){
                if(data['data']!= undefined)
                {
                    $scope.reqUrl = $scope.server_url+$scope.currAppName;
                    http_get($scope, $http);
                    $scope.reqStatus = "Delete Succeeded !";
                }
                else if(data['Error']!= undefined)
                {
                    $scope.reqStatus = data['Error'][0]['Message'];
                }
            })
            .error(function (){
                $scope.reqStatus = "Error Occurred !";
            });
    }
    else
    {
        $scope.reqStatus = "Please Provide a valid Table name !";
    }
    $scope.reqUrl = '';
}



// MAIN APP Controller
function schemaExpController($scope, $http, $location){

    // Init App Page
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

    // Get Current Url
    $scope.currUrl = function(){
      return $location.absUrl();
    };

    // Generates no of rows
    $scope.genRows = function(){
        var cols = parseInt($scope.noOfCols);
        if(cols > 10){
            $scope.rowError = "A Maximum of 10 Rows is allowed !";
        }
        else if(!isNaN(cols)){
            $scope.rowError = "";
            $scope.colIndex = new Array(cols);
            for( var i = 0; i < cols; i++){
                $scope.colIndex[i]={columnName:'', columnType:'', isKey:false, defaultVal:''};
            }
        }
        else{
            $scope.colIndex = undefined;
        }
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
        add_new_app($scope, $http);
    };

    // Deleting app
    $scope.deleteApp = function () {
        delete_app($scope, $http);
    };

    // Add Table
    $scope.addTable = function () {
        add_table($scope,$http);
    };

    // Delete Table
    $scope.deleteTable = function(){
        delete_table($scope, $http);
    }
}