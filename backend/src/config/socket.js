let ioInstance;

function setSocketServer(io) {
  ioInstance = io;
}

function getSocketServer() {
  return ioInstance;
}

module.exports = {
  setSocketServer,
  getSocketServer
};
