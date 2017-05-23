var app = require('express')();
var http = require('http');
var httpApp = http.Server(app);
var io = require('socket.io')(httpApp);
// var bodyParser = require('body-parser');
// var multer = require('multer'); // v1.0.5
// var upload = multer(); // for parsing multipart/form-data
var port = process.env.port || 1337;
var dmdServices = require('./dmdservices');

// app.use(bodyParser.json()); // for parsing application/json
// app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', function(req, res){
  res.send('<h1>Hello world</h1>');
});

app.get('/total-project', function (req, res) {
	dmdServices.totalProject(io, http.request);
	res.send('');
});

app.get('/media-playlist', function (req, res) {
  dmdServices.mediaPlaylist(io, http.request);
  res.send('');
});

app.get('/stream-update', function (req, res) {
  dmdServices.collabeesSingleStream(io, http.request, req.query.since);
  res.send('');
});

httpApp.listen(port, function(){
  console.log('listening on *:'+port);
});

io.on('connection', function(socket){
  console.log('a user connected');

  initPushData();

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

function initPushData() {
  dmdServices.collabeesStreams(io, http.request);
  dmdServices.totalProject(io, http.request);
  
  dmdServices.totalJobRequest(io, http.request);
  
  dmdServices.mediaPlaylist(io, http.request);

  dmdServices.jobPhases(io, http.request);
  // ...
}