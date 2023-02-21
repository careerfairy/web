/**
 * Client side pagination helper methods
 */
export default class PaginationHelper {
   constructor(
      public total: number,
      public perPageItems: number,
      public currentPage = 1
   ) {}

   totalPages() {
      return Math.round(this.total / this.perPageItems)
   }

   canNavigateToNext() {
      return this.currentPage < this.total / this.perPageItems
   }

   canNavigateToPrevious() {
      return this.currentPage > 1
   }

   nextPage() {
      if (this.canNavigateToNext()) {
         this.currentPage++
      }
   }

   previousPage() {
      if (this.canNavigateToPrevious()) {
         this.currentPage--
      }
   }
}
