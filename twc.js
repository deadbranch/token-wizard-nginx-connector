var net = require('net');
var LinkedList = require('./LinkedList').LinkedList

var ClientCommands = {
    genToken : 0x0,
    destroyToken : 0x1,
    getToken : 0x2
};

var ServerResponse = {
    tokenCreated : 0x0,
    tokenDestroyed : 0x1,
    tokenDoesNotExist : 0x2,
    tokenExists : 0x3
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
var requestQueue = new LinkedList();
var inputData;


exports.init = function (_tokenLength) {
    tokenLength = _tokenLength;
};

exports.get_token = function(token, handler) {
    if(requestQueue.length > 65536)
    {
        handler(true);
        return;
    }
    token += '\0';
    var buff = new Buffer(token.length+1+4);
    buff.writeUInt32LE(token.length+1, 0);
    buff.writeUInt8(ClientCommands.getToken, 4);
    buff.write(token, 5, token.length, 'ascii');
    client.write(buff);
    requestQueue.push(handler);
};

exports.gen_token = function(dataBuf, handler) {
    if(requestQueue.length > 65536)
    {
        handler(true);
        return;
    }
    var buff = new Buffer(dataBuf.length+1+4);
    dataBuf.copy(buff, 5, 0, dataBuf.length);
    buff.writeUInt32LE(dataBuf.length+1, 0);
    buff.writeUInt8(ClientCommands.genToken, 4);
    client.write(buff);
    requestQueue.push(handler);
};


exports.connect = function () {
    client.connect(10200, '127.0.0.1', function() {
        console.log('Connected');
        //client.write('Hello, server! Love, Client.');
    });
};

var inputBuffSize = 65536;
var inputBuff = Buffer.allocUnsafe(inputBuffSize);
var inputWriteOffset = 0;
var inputReadOffset = 0;
var inputLength = 0;

function handlePacket(packet) {
    var token = packet.readUInt8(0);
    switch(token) {
        case ServerResponse.tokenExists:
        {
            var retBuff = Buffer.allocUnsafe(packet.length-1);
            packet.copy(retBuff, 0, 1, packet.length);
            if(packet.length != 10)
                var a = 2;
            var handler = requestQueue.pop().value;
            setTimeout(function() {
                handler(false, retBuff);
            }, 0);
            break;
        }
        case ServerResponse.tokenCreated:
        {
            var retBuff = Buffer.allocUnsafe(packet.length);
            packet.copy(retBuff, 0, 0, packet.length);
            var handler = requestQueue.pop().value;
            setTimeout(function() {
                handler(false, retBuff);
            }, 0);
            break;
        }
        case ServerResponse.tokenDoesNotExist:
        {
            var handler = requestQueue.pop().value;
            setTimeout(function() {
                handler(true);
            }, 0);
            break;
        }
        default: {
            console.log("THERE IS NO HANDLER");
        }
    }
}

function handleRecv() {
    while(inputLength >= 4)
    {
        var size = inputBuff.readUInt32LE(inputReadOffset);
        if((size + 4) > inputLength)
            break;
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
    var offset = 0;
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

