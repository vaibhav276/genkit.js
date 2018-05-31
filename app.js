/* requires underscore.js */

$(function() {
   var p;
   var it;
   var mutRate;
   var stepDuration;
   var target;
   var evalType;
   var evalFn;
   var mutationFn;
   var matingFn;
   var gk;

   // The dna codes for our case
   var dnaCodes = 'abcdefghijklmnopqrstuvwxyz          ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

   /** Distance between two dna codes
    */
   var distance = {
      /**  The square of their difference
       */
      'squared-error': function(a, b) {
         return (a - b) * (a - b);
      },
      /**  Just their difference
       */
      'absolute': function(a, b) {
         if (a > b) return (a - b);
         else return (b - a);
      },
      /** Either 1 or 0
       */
      'binary': function(a, b) {
         return (a == b ? 1 : 0);
      }
   };

   var eval = {
      /** Cost is sum of errors at each position
       */
      'cost': function(str) {
         var zipped = _.zip(str, target);
         return _.foldl(zipped, function(a, e) {
            return a + (distance['squared-error'](e[0].charCodeAt(0), e[1].charCodeAt(0)));
         }, 0);
      },
      /** Fitness is ratio of correct codes vs total
       */
      'fitness': function(str) {
         var zipped = _.zip(str, target);
         var sum = _.foldl(zipped, function(a, e) {
            return a + (distance['binary'](e[0].charCodeAt(0), e[1].charCodeAt(0)));
         }, 0);
         return sum / str.length;
      }
   };

   /** Mutate a given dnaCode
    */
   var mutation = {
      /** It just moves either up or down (randomly)
       *   in the dna codes array
       */
      'updown': function(dnaCode, dnaCodes) {
         var direction = Math.random() > 0.5 ? 1 : -1;
         var dnaCodesIndex = dnaCodes.indexOf(dnaCode);
         dnaCodesIndex += direction;

         // wrap-around
         if (dnaCodesIndex < 0) {
            dnaCodesIndex = dnaCodes.length - 1;
         }
         if (dnaCodesIndex >= dnaCodes.length) {
            dnaCodesIndex = 0;
         }
         return dnaCodes[dnaCodesIndex];
      },
      /** It just assigns a new code randomly
       */
      'random': function(dnaCode, dnaCodes) {
         var r = getRandomInt(dnaCodes.length);
         return dnaCodes[r];
      }
   };

   /** Mating function
    */
   var mating = {
      /** It just picks first half from first parent
       *   and second half from second parent
       */
      'half-half': function(str1, str2) {
         // NOTE: str1 and str2 are of same lengths
         var mid = str1.length / 2;
         var part1 = _.take(str1, mid);
         var part2 = _.drop(str2, mid);
         return part1.concat(part2);
      }
   };

   function getRandomInt(max) {
      return Math.floor(Math.random() * Math.floor(max));
   }

   function checkConvergence(gene) {
      if (evalType == 'cost' && gene.cost == 0) {
         return true;
      } else if (evalType == 'fitness' && gene.fitness == 1.0) {
         return true;
      }
      return false;
   }

   $('#status').html("Ready");
   $("#startIterator").click(function() {
      target = $("#target").val();
      var popSize = $("#population-size").val();
      mutRate = $("#mutation-rate").val();
      evalType = $("input:radio[name='eval']:checked").val();
      evalFn = eval[evalType];
      mutationFn = mutation[$("input:radio[name='mutation']:checked").val()];
      matingFn = mating['half-half'];

      gk = new GenKit({
         dnaCodes: dnaCodes,
         evalType: evalType,
         eval: evalFn,
         mutate: mutationFn,
         mate: matingFn
      });

      if (gk.err) {
         alert(gk.err);
      } else {
         p = gk.randomPopulation(target, popSize);
         $('#status').html("Started");
         it = setInterval(iterate, $("#step-duration").val());
      }

   });

   $("#stopIterator").click(function() {
      $('#status').html("Stopped");
      clearInterval(it);
   });

   function iterate() {
      p = gk.score(p);
      var topGene = gk.topGene(p);
      $("#generation").html(p.generation);
      $("#best-gene").html(topGene.code);
      if (evalType == 'cost') {
         $("#best-gene-cost").html(topGene.cost);
         $("#best-gene-fitness").html("NA");
      } else if (evalType == 'fitness') {
         $("#best-gene-fitness").html(topGene.fitness);
         $("#best-gene-cost").html("NA");
      }
      refreshPopulationTable(p);

      if (checkConvergence(topGene)) {
         $('#status').html("Done");
         clearInterval(it);
      }
      p = gk.evolve(p, mutRate);
   }

   function refreshPopulationTable(pop) {
      $("#population-table tbody tr").remove();
      if (pop && pop.elements) {
         for (var i = 0; i < pop.elements.length; i++) {
            var score = undefined;
            if (evalType == 'cost') {
               score = pop.elements[i].cost;
            } else if (evalType == 'fitness') {
               score = pop.elements[i].fitness;
            }
            $("#population-table").append("<tr><td>" +
               pop.elements[i].code.join('') +
               "</td><td>" +
               score +
               "</td></tr>"
            );
         }
      }
   }

});
