/**
 * Created with JetBrains WebStorm.
 * User: vineeth
 * Date: 10/8/13
 * Time: 2:18 PM
 * To change this template use File | Settings | File Templates.
 */
var util = require('util');

var black = '\x1b[30;1m';
var red = '\x1b[31;1m';
var green = '\x1b[32;1m';
var yellow = '\x1b[33;1m';
var blue = '\x1b[34;1m';
var magenta = '\x1b[35;1m';
var cyan = '\x1b[36;1m';
var white = '\x1b[37;1m';
var reset = '\x1b[0m';

var PRINT_SKELETON = "%s%s:  %s%s";


var logger = exports;
logger.log = function(level, message) {
    if (typeof message !== 'string') {
        message = JSON.stringify(message);
    }
    printLogMessage(level, message);
};

function printLogMessage(level, message){
    var printMessage;
    if(level == 'error'){
        printMessage = util.format(PRINT_SKELETON, red, level, reset, message);
    }
    else if(level == 'info'){
        printMessage = util.format(PRINT_SKELETON, cyan, level, reset, message);
    }
    else if(level == 'warn'){
        printMessage = util.format(PRINT_SKELETON, yellow, level, reset, message);
    }
    else if(level == 'success'){
        printMessage = util.format(PRINT_SKELETON, green, level, reset, message);
    }
    else{
        printMessage = util.format(PRINT_SKELETON, black, level, reset, message);
    }
    console.log(printMessage);
}