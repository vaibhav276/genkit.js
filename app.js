$(function() {
   var p;
   var it;
   var mutRate;

   // The dna codes for our case
   var dnaCodes = 'abcdefghijklmnopqrstuvwxyz          ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

   /** Distance between two dna codes
    *  is the square of their ascii value difference
    */
   function error(a,b) {
      return (a.charCodeAt(0) - b.charCodeAt(0))*(a.charCodeAt(0) - b.charCodeAt(0));
   }
   /** Mutate a given dnaCode
    *  In our case, it just moves either up or down (randomly)
    *  in the dna codes array
    */
   function mutate(dnaCode, dnaCodes) {
      var direction = Math.random() > 0.5 ? 1 : -1;
      var dnaCodesIndex = dnaCodes.indexOf(dnaCode);
      dnaCodesIndex += direction;

      // wrap-around
      if (dnaCodesIndex < 0) { dnaCodesIndex = dnaCodes.length - 1; }
      if (dnaCodesIndex >= dnaCodes.length) { dnaCodesIndex = 0; }
      return dnaCodes[dnaCodesIndex];
   }
   /** Basic mating function
    *  In our case, it just picks first half from first parent
    *  and second half from second parent
    */
   function mate(str1, str2) {
      // NOTE: str1 and str2 are of same lengths
      var mid = str1.length / 2;
      var part1 = _.take(str1, mid);
      var part2 = _.drop(str2, mid);
      return part1.concat(part2);
   }

   var gk = new GenKit({
      dnaCodes: dnaCodes,
      error: error,
      mutate: mutate,
      mate: mate
   });

   $('#status').html("Ready");
   $("#startIterator").click(function() {
      var target1 = $("#target").val();
      var popSize = $("#population-size").val();
      mutRate = $("#mutation-rate").val();

      p = gk.randomPopulation(target1, popSize);
      $('#status').html("Started");
      it = setInterval(iterate, 1);
   });

   $("#stopIterator").click(function() {
      $('#status').html("Paused");
      clearInterval(it);
   });

   function iterate() {
      var topGene = gk.topGene(p);
      $("#generation").html(p.generation);
      $("#best-gene").html(topGene.code);
      $("#best-gene-cost").html(topGene.cost);
      refreshPopulationTable(p);

      if (topGene.cost == 0) {
         $('#status').html("Done");
         clearInterval(it);
      }
      var p1 = gk.evolve(p, mutRate);
      p1 = gk.score(p1);
      p = p1;
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
