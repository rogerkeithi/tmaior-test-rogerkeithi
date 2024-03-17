var express = require('express');
require('dotenv').config();
var cors = require('cors');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');

app.use(cors());
app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({extended: false}))

var Message = mongoose.model('Message',{ name : String, message : String, date: Date})
var SysMessage = mongoose.model('SysMessage',{ text : String, response : String, date: Date})

io.on('connection', (socket) =>{
    console.log('a user is connected')
})

mongoose.connect(`${process.env.DATABASE_URL}`);

var port = 3000;
http.listen(port, () => console.log(`Listening on port ${port}`));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

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
        const messageObj = new Message(req.body);
        await messageObj.save();
        io.emit('message', req.body);

        const responseFound = await SysMessage.findOne({text: {$regex: messageObj.message, $options: 'i'}});
        
        if(responseFound){
            const body = {name:'<b>Mensagem do sistema</b>', message: responseFound.response, date: new Date()};
            const sysMessage = new Message(body);
            await sysMessage.save();
            io.emit('message', body);
        }
        res.sendStatus(200);
    } catch (err) {
        console.error('Error saving message:', err);
        res.sendStatus(500);
    }
});