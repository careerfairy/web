import { Layout } from "./types"

/**
 * A custom hook that paginates elements based on the provided layout.
 * It calculates the number of items per page based on the layout's columns and rows,
 * then divides the elements into pages accordingly.
 *
 * @template ElementType - The type of elements that will be paginated.
 * @param {ElementType[]} elements - The array of elements to be paginated.
 * @param {Layout} layout - The layout configuration, including the number of columns and rows per page.
 * @returns {Array<Array<ElementType>>} An array of pages, each containing a subset of elements.
 */
export const getPaginatedGridLayout = <ElementType>(
   elements: ElementType[],
   layout: Layout
): Array<Array<ElementType>> => {
   const itemsPerPage = layout.columns * layout.rows
   const numOfPages = Math.ceil(elements.length / itemsPerPage)

   return Array.from({ length: numOfPages }, (_, pageIndex) => {
      const start = pageIndex * itemsPerPage
      return elements.slice(start, start + itemsPerPage)
   })
}
