var twc = require('./tokenwizard.js');

twc.init(32);
twc.connect();
/*
twc.invalidate("xya0baHvB2Nwx44xSWrkWtmyompvGGnlgY4Ken", function (err) {

});
twc.get_token("hn6QaaoPxoqvhD6VSvkP0SoYv7xMjCEemJh1JT", function (err, data) {
    if(!err)
       console.log(data.toString('ascii'));
});
*/
var i = 1;
var foo;

foo = function () {
    /*
    twc.get_token("4ytyba4fh2gBVgRT0FF2MbflUoAtKixsBrM3s0", function (err, data) {
        if(!err)
            ++i;//console.log(data.toString('ascii'));
    });
    /**/

    twc.gen_token(Buffer.from("12345", 'ascii'), 5, function (err, data) {
        if(!err)
        {
            //console.log(data.toString('ascii'));
            ++i;
        }
        else
            console.log("Threre is no token!");
    });
     /**/

    setImmediate(foo);
};

foo();
/*
*/
var benchmark;


benchmark = function() {
    console.log(i);
    //i = 0;
    setTimeout(benchmark, 1000);
};
benchmark();

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
