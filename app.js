
console.log("Loaded");

var x = new Gene();
var y = new Gene();
x.newRandom(20);
y.newRandom(20);

console.log("x = " + x.code);
console.log("y = " + y.code);

x.calcCost(y);

console.log("x/y cost = " + x.cost);

console.log("child = " + x.mate(y).code);

var p = new Population(new Gene("hello"), 20);
console.log(p);
p.score();
console.log(p);
$("#population").html(p.asHtml());
