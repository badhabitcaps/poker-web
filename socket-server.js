const { Server } = require('socket.io');
const io = new Server(3001, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('comment:new', (data) => {
    // Broadcast new comment to all clients
    io.emit('comment:new', data);
  });

  socket.on('vote:update', (data) => {
    // Broadcast vote update to all clients
    io.emit('vote:update', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

console.log('Socket.IO server running on ws://localhost:3001/'); 