var net = require('net');
var LinkedList = require('./LinkedList').LinkedList;
var Buffer = require('buffer').Buffer;
var fs = require('fs');

var ClientCommands = {
    genToken : 0x0,
    invalidateToken : 0x1,
    getToken : 0x2
};

var ServerResponses = {
    tokenCreated : 0x0,
    tokenInvalidated : 0x1,
    tokenDoesNotExist : 0x2,
    tokenExists : 0x3
};

var client = new net.Socket();
exports.client = client;
var tokenLength;

var bufLength = 65536;

var sendBuff = new Buffer(bufLength);
var sbWritePos = 0;
var sendTaskStarted = false;

var startDelay = 5;

function tryReplaceBuff(size) {
    if((sbWritePos + size) > bufLength) {
        //console.log(sbWritePos);
        client.write(sendBuff.slice(0, sbWritePos));
        sbWritePos = 0;
    }
}

function startSendTask() {
    if(sendTaskStarted)
        return;
    sendTaskStarted = true;
    setTimeout(function () {
        if(sbWritePos)
        {
            client.write(sendBuff.slice(0, sbWritePos));
            sbWritePos = 0;
        }
        sendTaskStarted = false;
    }, startDelay)
}

var requestQueue = new LinkedList();

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
    var packetLength = token.length+1+4;
    tryReplaceBuff(packetLength);
    var buff = sendBuff.slice(sbWritePos, sbWritePos + packetLength);
    buff.writeUInt32LE(token.length+1, 0);
    buff.writeUInt8(ClientCommands.getToken, 4);
    buff.write(token, 5, token.length, 'ascii');
    sbWritePos += packetLength;
    startSendTask();
    requestQueue.push(handler);
};

exports.invalidate =  function(token, handler) {
    if(requestQueue.length > 65536)
    {
        handler(true);
        return;
    }
    token += '\0';
    var packetLength = token.length+1+4;
    tryReplaceBuff(packetLength);
    var buff = sendBuff.slice(sbWritePos, sbWritePos + packetLength);
    buff.writeUInt32LE(token.length+1, 0);
    buff.writeUInt8(ClientCommands.invalidateToken, 4);
    buff.write(token, 5, token.length, 'ascii');
    requestQueue.push(handler);
    sbWritePos += packetLength;
    startSendTask();
};

exports.gen_token = function(dataBuf, lifeTime, handler) {
    if(requestQueue.length > 65536)
    {
        handler(true);
        return;
    }

    var packetLength = dataBuf.length+1+4+4;
    tryReplaceBuff(packetLength);
    var buff = sendBuff.slice(sbWritePos, sbWritePos + packetLength);
    dataBuf.copy(buff, 9, 0, dataBuf.length);
    buff.writeUInt32LE(dataBuf.length+1+4, 0);
    buff.writeUInt8(ClientCommands.genToken, 4);
    buff.writeUInt32LE(lifeTime, 5);
    requestQueue.push(handler);
    sbWritePos += packetLength;
    startSendTask();
};

exports.connect = function (ip, port) {
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
        case ServerResponses.tokenExists:
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
        case ServerResponses.tokenCreated:
        {
            var retBuff = Buffer.allocUnsafe(packet.length-1);
            packet.copy(retBuff, 0, 1, packet.length);
            var handler = requestQueue.pop().value;
            setTimeout(function() {
                handler(false, retBuff);
            }, 0);
            break;
        }
        case ServerResponses.tokenDoesNotExist:
        {
            var handler = requestQueue.pop().value;
            setTimeout(function() {
                handler(true);
            }, 0);
            break;
        }
        case ServerResponses.tokenInvalidated:
        {
            var handler = requestQueue.pop().value;
            setTimeout(function() {
                handler(false);
            }, 0);
            break;
        }
        default: {
            console.error("THERE IS NO HANDLER");
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