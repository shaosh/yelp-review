var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var FileStreamRotator = require('file-stream-rotator');

var routes = require('./routes/index');

var app = express();

//create log file
var logDirectory = __dirname + '/logs'
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

var accessLogStream = FileStreamRotator.getStream({
  filename: logDirectory + '/access-%DATE%.log',
  frequency: 'daily',
  verbose: false
})
// setup the logger
app.use(logger('combined', {stream: accessLogStream}));
app.use(logger('dev'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({error: {
      message: err.message,
      error: err
    }});
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({error: {
    message: err.message,
    error: {}
  }});
});

// START THE SERVER
var port = process.env.PORT || 3000;        // set our port
app.listen(port);
console.log('Magic happens on port ' + port);
