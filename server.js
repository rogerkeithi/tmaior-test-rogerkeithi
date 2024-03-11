var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
require('dotenv').config()

app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({extended: false}))

var Message = mongoose.model('Message',{ name : String, message : String})

io.on('connection', () =>{
    console.log('a user is connected')
})

mongoose.connect(`${process.env.DATABASE_URL}`);

var port = 3001;
http.listen(port, () => console.log(`Listening on port ${port}`));

//Endpoints
app.get('/messages', async (req, res) => {
    try {
        const messages = await Message.find({});
        res.send(messages);
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).send('Error fetching messages');
    }
});

app.post('/messages', async (req, res) => {
    try {
        const message = new Message(req.body);
        await message.save();
        io.emit('message', req.body);
        res.sendStatus(200);
    } catch (err) {
        console.error('Error saving message:', err);
        res.sendStatus(500);
    }
});