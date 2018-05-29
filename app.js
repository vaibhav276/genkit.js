$(function() {
   var p;
   var it;
   var mutRate;
   $('#status').html("Ready");
   $("#startIterator").click(function() {
      var target1 = $("#target").val();
      var popSize = $("#population-size").val();
      mutRate = $("#mutation-rate").val();

      p = randomPopulation(target1, popSize);
      $("#generation").html(p.generation);
      $("#best-gene").html(topGene(p).code)
      refreshPopulationTable(p);
      $('#status').html("Started");
      it = setInterval(iterate, 1);
   });

   $("#stopIterator").click(function() {
      $('#status').html("Paused");
      clearInterval(it);
   });

   function iterate() {
      if (topGene(p).cost == 0) {
         $('#status').html("Done");
         clearInterval(it);
      }
      var p1 = evolve(p, mutRate);
      var p2 = score(p1)
      $("#generation").html(p2.generation);
      $("#best-gene").html(topGene(p2).code)
      refreshPopulationTable(p2);
      p = p2;
   }

   function refreshPopulationTable(pop) {
      $("#population-table tbody tr").remove();
      for (var i = 0; i < pop.elements.length; i++) {
         $("#population-table").append("<tr><td>" +
                                       pop.elements[i].code.join('') +
                                       "</td><td>" +
                                       pop.elements[i].cost +
                                       "</td></tr>"
                                      );
      }
   }

});
