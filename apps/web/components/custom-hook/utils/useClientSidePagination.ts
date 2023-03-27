import { useMemo, useState, useCallback } from "react"

interface PaginationOptions<T> {
   data: T[]
   itemsPerPage: number
}

interface PaginationResult<T> {
   currentPageData: T[]
   currentPage: number
   totalPages: number
   goToPage: (page: number) => void
   hasNextPage: boolean
   hasPreviousPage: boolean
}

const useClientSidePagination = <T>(
   options: PaginationOptions<T>
): PaginationResult<T> => {
   const { data, itemsPerPage } = options
   const [currentPage, setCurrentPage] = useState<number>(1)

   const totalPages = Math.ceil(data.length / itemsPerPage)

   const goToPage = useCallback(
      (page: number) => {
         if (page < 1 || page > totalPages) {
            return
         }
         setCurrentPage(page)
      },
      [totalPages]
   )

   const currentPageData = useMemo(() => {
      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      return data.slice(startIndex, endIndex)
   }, [currentPage, data, itemsPerPage])

   return useMemo(
      () => ({
         currentPageData,
         currentPage,
         totalPages,
         goToPage,
         hasNextPage: currentPage < totalPages,
         hasPreviousPage: currentPage > 1,
      }),
      [currentPageData, currentPage, totalPages, goToPage]
   )
}

export default useClientSidePagination
