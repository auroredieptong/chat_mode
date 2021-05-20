var http = require('http');
var fs = require('fs');
const express = require('express');
const path = require('path');
const app=express();
app.use(express.static(path.join(__dirname,'publiv')));
app.use((req,res,next)=>
{
        fs.readFile('./index.html','utf-8',function(error,content){
            res.writeHead(200,{"Content-Type":"text/html"});
            res.end(content);
        });
})
app.set('port',process.env.PORT || 8081);
var server =  http.createServer(app);

var io = require('socket.io').listen(server);
io.sockets.on('connection',function(socket,pseudo){
    socket.emit('message', 'Vous êtes bien connecté')
    socket.on('nouveau',function(pseudo){
        socket.pseudo=pseudo
        socket.broadcast.emit('join',socket.pseudo +' a rejoint la discussion');
    })
    socket.on('message',function(message){
        socket.broadcast.emit('newMessage',{pseudo:socket.pseudo+' :',message:message})
    })
    socket.on('ecrit',function(desc){
        if(desc!='vide')
        socket.broadcast.emit('ecrit',socket.pseudo + ' '+ desc)
        else
        socket.broadcast.emit('ecrit','')
    })
    socket.on('disconnect',()=>{
        socket.broadcast.emit('join',socket.pseudo +' a quitté la discussion');
    })
    socket.on('pseudo',function(pseudo){
        var ancien=socket.pseudo
        socket.pseudo=pseudo
        socket.broadcast.emit('join',ancien + ' a changé son pseudo pour '+socket.pseudo)
    })
   

})
server.listen(8081);