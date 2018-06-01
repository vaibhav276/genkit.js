/* requires underscore.js */

// The dna codes for our application
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
   'cost': function(str, target) {
      var zipped = _.zip(str, target);
      return _.foldl(zipped, function(a, e) {
         return a + (distance['squared-error'](e[0].charCodeAt(0), e[1].charCodeAt(0)));
      }, 0);
   },
   /** Fitness is ratio of correct codes vs total
    */
   'fitness': function(str, target) {
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
