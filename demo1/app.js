$(function() {
   $('form').submit(false);
   $(".fullscreen.modal").modal("hide");

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

      var evalFnWrapper = function(str) {
         return evalFn(str, target);
      };

      gk = new GenKit({
         dnaCodes: dnaCodes,
         evalType: evalType,
         eval: evalFnWrapper,
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

   $("#show-population").click(function() {
      $(".fullscreen.modal").modal("show");
   });

});
