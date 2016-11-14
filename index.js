var twc = require('./twc.js');

twc.init(32);
twc.connect();
twc.get_token("222sfsfsfsadfsfsfsdfpoiwerpowe222", function (err, data) {
    if(!err)
        console.log(data);
});

var foo;
foo = function() {
    twc.get_token("!1!", function (err, data) {
        if(!err)
            console.log(data);
    });
};

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

var aWhile = 0; // 5 seconds
var doSomethingAfterAWhile = function() {
    aWhile = 1;
    foo();
    if(randomInt(0,10)>1)
        doSomethingAfterAWhile();
    else
        setTimeout( doSomethingAfterAWhile, aWhile );
};
doSomethingAfterAWhile();

//twc.client.write('scuko');
