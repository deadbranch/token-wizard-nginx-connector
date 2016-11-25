var twc = require('./twc.js');

twc.init(32);
twc.connect();
//twc.get_token("222sfsfsfsadfsfsfsdfpoiwerpowe222", function (err, data) {
//    if(!err)
//        console.log(data);
//});

var i = 1;
var foo;


foo = function() {
    twc.gen_token(Buffer.from("lalka", 'ascii'), 10, function (err, data) {
        if(!err)
        {
            //console.log(data.toString('ascii'));
            ++i;

        }
        else
            console.log("Threre is no token!");
    });
   /* twc.get_token("VrB4dacv8L239RPEOsRsgHh1WGcCKHw0jiPhTv", function (err, data) {
        if(!err)
        {
            ++i;
            console.log(data.toString('ascii'));
            console.log(data.length);
        }
        else
        {
            ++i;
            console.log("Threre is no token!");
        }
    });
    /**/

    setImmediate(function () {
        foo();
    });
};
foo();




/*
*/
var benchmark;
benchmark = function() {
    console.log(i);
    i = 0;
    setTimeout(benchmark, 1000);
};
benchmark();

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
