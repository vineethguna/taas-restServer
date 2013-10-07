
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var appOperations = require('./routes/appOperations');
var metadata = require('./routes/metadata');
var dbops = require('./routes/dbOperations');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//REST CALLS
app.get('/', routes.index);
app.get('/:appName/metadata', metadata.handleAppMetadata);
app.get('/:appName/:tableName/metadata', metadata.getTableMetadata);
app.post('/:appName', appOperations.CreateApp);
app.post('/:appName/:tableName', dbops.createAppTable);
app.post('/:appName/:tableName/insert', dbops.insertIntoAppTable);
app.get('/:appName/:tableName/fetch', dbops.fetchRecordsFromAppTable);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
