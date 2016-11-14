var net = require('net');

var ClientCommands = {
    createToken : 0x0,
    destroyToken : 0x1,
    getToken : 0x2
};

var client = new net.Socket();
exports.client = client;
var tokenLength;
function int32ToBytes(num) {
    arr = new ArrayBuffer(4); // an Int32 takes 4 bytes
    view = new DataView(arr);
    view.setUint32(0, num, false); // byteOffset = 0; litteEndian = false
    return arr;
}

console.log("lalka");

var requestQueue = [];

exports.init = function (_tokenLength) {
    tokenLength = _tokenLength;
};

exports.get_token = function(token, handler) {
    token += '\0';
    var buff = new Buffer(token.length+1+4);
    buff.writeUInt32LE(token.length+1, 0);
    buff.writeUInt8(ClientCommands.getToken, 4);
    buff.write(token, 5, token.length, 'ascii');
    client.write(buff);
    requestQueue.push(handler);
    handler(false, {});
};


exports.connect = function () {
    client.connect(10200, '127.0.0.1', function() {
        console.log('Connected');
        //client.write('Hello, server! Love, Client.');
    });
};

client.on('data', function(data) {
    console.log('Received: ' + data);
    //client.destroy(); // kill client after server's response
});

client.on('close', function() {
    console.log('Connection closed');
});

