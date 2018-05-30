/* Requires: underscore.js */

var GenKit = function(config) {

   this.dnaCodes = config.dnaCodes; // The dna codes
   this.error = config.error; // The error function to tell us distance between two dna codes
   this.mutate = config.mutate; // Mutation function for a dnaCode
   this.mate = config.mate;
   var theObj = this;

   function getRandomInt(max) {
      return Math.floor(Math.random() * Math.floor(max));
   }

   /********** Gene functions ************/
   var Gene = function() {
      this.code = [];
      this.score = 0.0;
      this.cost = Number.MAX_SAFE_INTEGER;
   };
   /** Generate a random gene sequence */
   function randomDnaSequence(length) {
      return _.sample(theObj.dnaCodes, length);
   }
   /** Mutate, or not */
   function maybeMutate(gene, chance) {
      if (Math.random() > chance) return gene;

      var index = getRandomInt(gene.code.length);
      var res = gene;
      res.code[index] = theObj.mutate(res.code[index], theObj.dnaCodes);
      return res;
   }
   /** Mate two genes
    */
   function mateWrapper(gene1, gene2) {
      var res = new Gene();
      res.code = theObj.mate(gene1.code, gene2.code);
      return res;
   }
   /** Cost is sum of errors at each position
    */
   function calcCost(gene, target) {
      var zipped = _.zip(gene.code, target.code);
      return _.foldl(zipped, function(sum, a) {
         return sum + (theObj.error(a[0],a[1]));
      }, 0);
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
         gene.code = randomDnaSequence(target.length);
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

      // Accept-reject mechanism
      // https://www.wikiwand.com/en/Rejection_sampling
      while (true) {
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
         var child = maybeMutate (mateWrapper(p1, p2), mutationRate);
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

   return {
      randomPopulation: randomPopulation,
      evolve: evolve,
      score: score,
      topGene: topGene
   };
}
