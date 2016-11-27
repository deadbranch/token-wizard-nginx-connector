var twc = require('./tokenwizard.js');

twc.init(32);
twc.connect();
twc.invalidate("xya0baHvB2Nwx44xSWrkWtmyompvGGnlgY4Ken", function (err) {

});
twc.get_token("xya0baHvB2Nwx44xSWrkWtmyompvGGnlgY4Ken", function (err, data) {
    if(!err)
       console.log(data.toString('ascii'));
});

var i = 1;
var foo;

twc.gen_token(Buffer.from("12345", 'ascii'), 1000, function (err, data) {
    if(!err)
    {
        console.log(data.toString('ascii'));
        ++i;
    }
    else
        console.log("Threre is no token!");
});

/*
*/
var benchmark;
benchmark = function() {
    console.log(i);
    i = 0;
    setTimeout(benchmark, 1000);
};
//benchmark();

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
