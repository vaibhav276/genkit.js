/* Requires: underscore.js */

var dnaCodes = 'abcdefghijklmnopqrstuvwxyz          ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function getRandomInt(max) {
   return Math.floor(Math.random() * Math.floor(max));
}

function diff(a,b) {
   return a.charCodeAt(0) - b.charCodeAt(0);
}

var Gene = function(code) {
   if (code) this.code = code;
   this.cost = 9999;
   this.score = 0;
}
Gene.prototype.code = '';
Gene.prototype.newRandom = function(length) {
   this.code = _.sample(dnaCodes, length);
}
Gene.prototype.maybeMutate = function(chance) {
   if (Math.random() > chance) return;

   var index = getRandomInt(this.code.length);
   var newCode = dnaCodes[getRandomInt(dnaCodes.length)];
   this.code[index] = newCode;
   return this;
}
Gene.prototype.mate = function(gene) {
   var mid = this.code.length / 2;
   var part1 = _.take(this.code, mid);
   var part2 = _.drop(gene.code, mid);
   return new Gene(part1 + part2);
}
Gene.prototype.calcCost = function(target) {
   var zipped = _.zip(this.code, target.code);
   var sqSum = _.foldl(zipped, function(sum, a) { return sum + (diff(a[0],a[1]))*(diff(a[0],a[1])); }, 0);
   this.cost = sqSum;
   return this;
}


var Population = function(target, size) {
   this.elements = [];
   this.target = target;
   this.generation = 0;

   while(size--) {
      var gene = new Gene();
      gene.newRandom(target.code.length);
      this.elements.push(gene);
   }
}
Population.prototype.asHtml = function() {
   var res = '';
   res += ("<h2>Generation: " + this.generation + "</h2>");
   res += ("<ul>");
   for (var i = 0; i < this.elements.length; i++) {
      res += ("<li>" + this.elements[i].code + " (" + this.elements[i].cost + ")");
   }
   res += ("</ul>");
   return res;
};
Population.prototype.sort = function() {
   this.members.sort(function(a, b) {
      return a.cost - b.cost;
   });
}
Population.prototype.score = function() {
   var tgt = this.target;
   this.elements = _.map(this.elements, function(x) { return x.calcCost(tgt); })
   var minCost = _.min(this.elements, function(x) { return x.cost; });
   var maxCost = _.max(this.elements, function(x) { return x.cost; });
   var range = maxCost.cost - minCost.cost;
   this.elements = _.map(this.elements, function (x) {
      x.score = 1.0 - ( (x.cost - minCost.cost) / range );
      return x;
   });
   return this;
}
