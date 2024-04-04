const { createServer } = require('http')
const cors = require('cors');
const httpServer = createServer();
const io = require("socket.io")(httpServer,{
  cors:{
    origin:"*"
  }
})


const socketIds = [];

io.on('connection', socket => {
    console.log("new User",socket.id)
    socket.on('join', () => {
        socketIds.push(socket.id)
        console.log("socketIds",socketIds)
    });

    socket.on('offer', payload => {
        io.to(payload.target).emit('offer', payload);
    });

    socket.on('answer', payload => {
        io.to(payload.target).emit('answer', payload);
    });

    socket.on('ice-candidate', incoming => {
        io.to(incoming.target).emit('ice-candidate', incoming.candidate);
    });

    /*
    data = {
        target:socketId,
        chunkId:string

    }
    */
    socket.on('getChunks',(data)=>{
        for(let i=0;i<11;i++){
            const newPayload = {
                fileID:data.fileID,
                requesterID:data.requesterID,
                chunkId:i,
            }
            socket.broadcast.emit('sendChunks',newPayload)
        }
    })

    socket.on('disconnect', () => {
        const index = socketIds.indexOf(socket.id);
        if (index !== -1) {
            socketIds.splice(index, 1);
        }
        console.log("User disconnected", socket.id);
    });
});



httpServer.listen(9000, () => console.log("Server is up and running on Port 9000"));
