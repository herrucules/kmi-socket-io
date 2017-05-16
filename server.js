var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', function(req, res){
  res.send('<h1>Hello world</h1>');
});

app.post('/total-project', function (req, res) {
	io.emit('total-project', req.body.total);
	res.send('ok')
});

app.get('/draw', function (req, res) {
  io.emit('draw', req.query);
  res.send('ok')
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.on('connection', function(socket){
  console.log('a user connected');
  // socket.on('now-playing', function(msg) {
  // 	// panggil service ke collabees..
  // 	console.log(msg);
  // });
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});