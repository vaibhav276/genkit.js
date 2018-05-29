/* Requires: underscore.js */

var dnaCodes = 'abcdefghijklmnopqrstuvwxyz          ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function getRandomInt(max) {
   return Math.floor(Math.random() * Math.floor(max));
}

/** Squared error between two char codes
 */
function charSqError(a,b) {
   return (a.charCodeAt(0) - b.charCodeAt(0))*(a.charCodeAt(0) - b.charCodeAt(0));
}

/********** Gene functions ************/
var Gene = function() {
   this.code = []
   this.score = 0.0;
   this.cost = 9999;
}
/** Generate a random gene sequence */
function randomSequence(length) {
   return _.sample(dnaCodes, length);
}
/** Mutate, or not */
function maybeMutate(gene, chance) {
   if (Math.random() > chance) return gene;

   var index = getRandomInt(gene.code.length);
   var direction = Math.random() > 0.5 ? 1 : -1;
   var dnaCodesIndex = dnaCodes.indexOf(gene.code[index]);
   dnaCodesIndex += direction;

   // wrap-around
   if (dnaCodesIndex < 0) { dnaCodesIndex = dnaCodes.length - 1; }
   if (dnaCodesIndex >= dnaCodes.length) { dnaCodesIndex = 0; }

   var res = gene;
   res.code[index] = dnaCodes[dnaCodesIndex];
   return res;
}
/** Basic mating algorithm
 */
function mate(gene1, gene2) {
   var mid = gene1.code.length / 2;
   var part1 = _.take(gene1.code, mid);
   var part2 = _.drop(gene2.code, mid);
   var res = new Gene();
   res.code = part1.concat(part2);
   return res;
}
/** Cost is sum of squared errors at each position
 */
function calcCost(gene, target) {
   var zipped = _.zip(gene.code, target.code);
   var sqSum = _.foldl(zipped, function(sum, a) { return sum + (charSqError(a[0],a[1])); }, 0);
   return sqSum;
}

/************* Population functions ***************/
var Population = function(target) {
   this.elements = [];
   this.target = new Gene();
   this.target.code = target;
   this.generation = 0;
}
/** Generate a new random population
 *  Used for initialization
 */
function randomPopulation(target, size) {
   var res = new Population(target);
   while(size--) {
      var gene = new Gene();
      gene.code = randomSequence(target.length);
      res.elements.push(gene);
   }
   return res;
}
/** Calculate normalized (0-1) score from cost range of population
 */
function score(population) {
   var costedElements = _.map(population.elements, function(x) {
      x.cost = calcCost(x, population.target);
      return x;
   });
   var minCost = _.min(costedElements, function(x) { return x.cost; });
   var maxCost = _.max(costedElements, function(x) { return x.cost; });
   var range = maxCost.cost - minCost.cost;
   if (range == 0) range = 1; // Prevent divide by 0 - all elements are same
   var scoredElements = _.map(population.elements, function (x) {
      x.score = 1.0 - ( (x.cost - minCost.cost) / range );
      return x;
   });

   var res = population;
   res.elements = scoredElements;

   return res;
}
/** Pick a random parent, based on giving higher chance
 *  to elements having higher score
 */
function pickParent(population) {
   // NOTE: population must be scored already

   var min = _.min(population.elements, function(x) { return x.score; });
   var max = _.max(population.elements, function(x) { return x.score; });
   var potentialParent = _.sample(population.elements);
   if (min.score == max.score) {
      // No variation
      // Maybe initial case, or somewhere during evolution
      return potentialParent;
   }

   while (true) {
      // Accept-reject mechanism
      // https://www.wikiwand.com/en/Rejection_sampling
      if (potentialParent.score > Math.random()) {
         return potentialParent;
      }
      potentialParent = _.sample(population.elements);
   }
}
/** Evolve population to its next generation
 */
function evolve(population, mutationRate) {
   var children = [];
   var nextGenSize = population.elements.length;

   while (children.length < nextGenSize) {
      var p1 = pickParent(population);
      var p2 = pickParent(population);
      var child = maybeMutate (mate(p1, p2), mutationRate);
      children.push(child);
   }
   var res = population;
   res.generation = population.generation + 1;
   res.elements = children;

   return res;
}
/** Pick top gene for convergence checks
 */
function topGene(population) {
   // NOTE: population must be scored already
   return _.min(population.elements, function(x) { return x.cost; });
}

