export function getRandom(arr, n) {
   var result = new Array(n),
      len = arr.length,
      taken = new Array(len);
   if (n > len) return arr;
   while (n--) {
      var x = Math.floor(Math.random() * len);
      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
   }
   return result;
}

export function getMaxSlides(intendedSlidesToShow, numberOfElements) {
   if (intendedSlidesToShow > numberOfElements) {
      return numberOfElements;
   } else {
      return intendedSlidesToShow;
   }
}
