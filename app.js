
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
var index = require('./routes/index');
var httpOptions = require('./routes/httpOptions');

var app = express();

// all environments
app.use(express.static(path.join(__dirname, 'public')));
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//REST CALLS
app.get('/', routes.index);
app.get('/:appName/metadata', metadata.handleAppMetadata);
app.get('/:appName/:tableName/metadata', metadata.getTableMetadata);
app.post('/:appName', appOperations.CreateApp);
app.del('/:appName', appOperations.DeleteApp);
app.post('/:appName/join', dbops.JoinOnTables);
app.post('/:appName/:tableName', dbops.createAppTable);
app.del('/:appName/:tableName', dbops.DropTable);
app.post('/:appName/:tableName/insert', dbops.insertIntoAppTable);
app.get('/:appName/:tableName/fetch', dbops.fetchRecordsFromAppTable);
app.del('/:appName/:tableName/delete', dbops.DeleteRecordsFromTable);
app.put('/:appName/:tableName/update', dbops.UpdateRecordInTable);
app.get('/api-docs-info', index.apiDocs);
app.get('/api-docs-info/metadataDocs', index.metadata);
app.get('/api-docs-info/appOperationsDocs', index.appOperations);
app.get('/api-docs-info/appTableOperationsDocs', index.appTableOperations);
app.all('*',httpOptions.checkHeader);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
