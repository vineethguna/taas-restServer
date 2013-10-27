var explorer = angular.module('SchemaExplorer',[]);

/* configuring get and post*/
explorer.config(function ($httpProvider) {
    //$httpProvider.defaults.headers.post['Content-Type'] = 'application/json';
      //  OR 'application/x-www-form-urlencoded; charset=UTF-8';

    // changing get
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    //console.log($httpProvider);
});
function getValues(object)
{
    var values = [];
    var keys = Object.keys(object);
    for(var i = 0,length = keys.length; i < length; i++)
    {
        values.push(object[keys[i]]);
    }
    return values;
}
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
    else if(data['index']!= undefined)
    {
        $scope.index = '';
        var objects = getValues(data['index']);
        for( var i = 0, lenght = objects.length; i<lenght;i++)
        {
            var key = Object.keys(objects[i])[0];
            $scope.index +=
                '<div class="container"> <table class="table">' +
                '<th style="padding-right:10px ">'+ 'URL' +'</th></th><th>'+key+'</th>'+
                '<tr><td> Type</td><td>'+objects[i][key].type+'</td></tr>'+
                '<tr><td> Parameters</td><td>'+objects[i][key].parameters+'</td></tr>'+
                '<tr><td> Function</td><td>'+objects[i][key].function+'</td></tr>'+
                '</table></div>';
        }
    }
    else
    {
        $scope.server_response_json = data;
    }
}

function schemaExpController($scope, $http){
    // http get method
    $scope.httpGet = function () {
        $scope.index = '';
        $http({
            method:'GET',
            url:$scope.urlInput,
            data:''
            })
            .success(function(data){
                onSuccessDataHandler($scope, data);
            })
            .error(function(data){
                console.log("Error"+data)});
    };

    //http post
    $scope.httpPost = function () {
        $scope.index = '';
        if(($scope.bodyInput == undefined) || ($scope.bodyInput == ''))
        {
            $scope.bodyInput = '{}';
        }
        $http.post($scope.urlInput, JSON.parse($scope.bodyInput))
            .success(function(data){
                onSuccessDataHandler($scope, data);
                $scope.bodyInput = '';
            })
            .error(function(data){
                console.log('Error'+data);
                $scope.bodyInput = '';
            });
    };
}
