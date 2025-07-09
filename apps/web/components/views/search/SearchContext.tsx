import { useRouter } from "next/router"
import {
   createContext,
   ReactNode,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react"
import { useRecentSearches } from "./useRecentSearches"

type SearchContextType = {
   searchQuery: string
   setSearchQuery: (query: string) => void
   handleDropdownSelect: (option: string) => void
   recentSearches: string[]
   removeRecentSearch: (search: string) => void
   clearRecentSearches: () => void
   handleSearchSubmit: (query: string) => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

type SearchContextProviderType = {
   children: ReactNode
}

export const SearchProvider = ({ children }: SearchContextProviderType) => {
   const [searchQuery, setSearchQuery] = useState("")
   const router = useRouter()
   const {
      recentSearches,
      addRecentSearch,
      removeRecentSearch,
      clearRecentSearches,
   } = useRecentSearches()

   // Initialize search query from URL parameter
   useEffect(() => {
      if (router.isReady && router.query.q) {
         const queryFromUrl = Array.isArray(router.query.q)
            ? router.query.q[0]
            : router.query.q
         if (queryFromUrl) {
            setSearchQuery(queryFromUrl)
         }
      }
   }, [router.isReady, router.query.q])

   const handleSearchSubmit = useCallback(
      (query: string) => {
         if (query.trim()) {
            const trimmedQuery = query.trim()
            addRecentSearch(trimmedQuery)
            // Redirect to search page with query as URL parameter
            router.push(`/portal/search?q=${encodeURIComponent(trimmedQuery)}`)
         }
      },
      [router, addRecentSearch]
   )

   const handleDropdownSelect = useCallback(
      (option: string) => {
         setSearchQuery(option)
         handleSearchSubmit(option)
      },
      [handleSearchSubmit]
   )

   const value: SearchContextType = useMemo(() => {
      return {
         searchQuery,
         setSearchQuery,
         handleDropdownSelect,
         recentSearches,
         removeRecentSearch,
         clearRecentSearches,
         handleSearchSubmit,
      }
   }, [
      searchQuery,
      setSearchQuery,
      handleDropdownSelect,
      recentSearches,
      removeRecentSearch,
      clearRecentSearches,
      handleSearchSubmit,
   ])

   return (
      <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
   )
}

export const useSearchContext = () => {
   const context = useContext(SearchContext)

   if (!context) {
      throw new Error(
         "useSearchContext must be used within a SearchContextProvider"
      )
   }

   return context
}

export default SearchContext
