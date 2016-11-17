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
var inputData;


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

var inputBuffSize = 65536;
var inputBuff = new Buffer(inputBuffSize);
var inputWriteOffset = 0;
var inputReadOffset = 0;
var inputLength = 0;
function handlePacket(packet, size) {
    console.log(packet);
}

function handleRecv() {
    while(inputLength >= 4)
    {
        var size = inputBuff.readUInt32LE(inputReadOffset);
        if((size + 4) > inputLength)
            break;
        console.log(size);
        handlePacket(inputBuff.slice(inputReadOffset + 4, inputReadOffset + 4 + size), size);
        inputReadOffset += size + 4;
        inputLength -= size + 4;
    }
    if(inputLength > 0) {
        inputBuff.copy(inputBuff, 0, inputReadOffset, inputLength);
    }
    inputReadOffset = 0;
    inputWriteOffset = inputLength;
}

client.on('data', function(data) {
    var offset =0;
    var bytesLeft = data.length;
    while(bytesLeft > 0) {
        var bytesToCopy = Math.min(inputBuffSize-inputWriteOffset, bytesLeft);
        data.copy(inputBuff, inputWriteOffset, offset, data.length);
        bytesLeft -= bytesToCopy;
        offset += bytesToCopy;
        inputWriteOffset += bytesToCopy;
        inputLength += bytesToCopy;
        handleRecv();
    }
});


client.on('close', function() {
    console.log('Connection closed');
});

