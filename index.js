var twc = require('./twc.js');

twc.init(32);
twc.connect();
//twc.get_token("222sfsfsfsadfsfsfsdfpoiwerpowe222", function (err, data) {
//    if(!err)
//        console.log(data);
//});

var foo;
foo = function() {
    twc.get_token("Eaaaaa7F2pONMfFmmcEs2zgeo0yGMYZWd2ST6g", function (err, data) {
        if(!err)
            console.log(data);
    });
    setTimeout(function () {
        foo();
    }, 1);
};

foo();

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

