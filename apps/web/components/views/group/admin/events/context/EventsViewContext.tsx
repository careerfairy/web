import {
   createContext,
   ReactNode,
   useCallback,
   useContext,
   useMemo,
   useState,
} from "react"
import { LivestreamStatsSortOption } from "../../../../../custom-hook/live-stream/useGroupLivestreamsWithStats"

type EventsViewContextValue = {
   sortBy: LivestreamStatsSortOption
   setSortBy: (sortBy: LivestreamStatsSortOption) => void
   handleTableSort: (field: "title" | "date" | "registrations") => void
   getSortDirection: (
      field: "title" | "date" | "registrations"
   ) => "asc" | "desc"
   isActiveSort: (field: "title" | "date" | "registrations") => boolean
}

const EventsViewContext = createContext<EventsViewContextValue | null>(null)

/** Maps table fields to their corresponding sort options [asc, desc] */
const sortMappings = {
   title: [
      LivestreamStatsSortOption.TITLE_ASC,
      LivestreamStatsSortOption.TITLE_DESC,
   ],
   date: [
      LivestreamStatsSortOption.START_ASC,
      LivestreamStatsSortOption.START_DESC,
   ],
   registrations: [
      LivestreamStatsSortOption.REGISTRATIONS_ASC,
      LivestreamStatsSortOption.REGISTRATIONS_DESC,
   ],
} as const

/** Maps table fields to their asc/desc sort options */
const fieldMappings = {
   title: {
      asc: LivestreamStatsSortOption.TITLE_ASC,
      desc: LivestreamStatsSortOption.TITLE_DESC,
   },
   date: {
      asc: LivestreamStatsSortOption.START_ASC,
      desc: LivestreamStatsSortOption.START_DESC,
   },
   registrations: {
      asc: LivestreamStatsSortOption.REGISTRATIONS_ASC,
      desc: LivestreamStatsSortOption.REGISTRATIONS_DESC,
   },
} as const

type EventsViewProviderProps = {
   children: ReactNode
   initialSort?: LivestreamStatsSortOption
}

export const EventsViewProvider = ({
   children,
   initialSort = LivestreamStatsSortOption.START_DESC,
}: EventsViewProviderProps) => {
   const [sortBy, setSortBy] = useState<LivestreamStatsSortOption>(initialSort)

   /** Toggles sort direction for a field - defaults to desc, switches to asc if already desc */
   const handleTableSort = useCallback(
      (field: "title" | "date" | "registrations") => {
         const [ascOption, descOption] = sortMappings[field]

         // If currently sorting by this field in desc, switch to asc
         if (sortBy === descOption) {
            setSortBy(ascOption)
         } else {
            // Otherwise, sort by desc (default)
            setSortBy(descOption)
         }
      },
      [sortBy]
   )

   const getSortDirection = useCallback(
      (field: "title" | "date" | "registrations"): "asc" | "desc" => {
         const fieldMap = fieldMappings[field]
         if (sortBy === fieldMap.asc) return "asc"
         if (sortBy === fieldMap.desc) return "desc"
         return "desc" // default
      },
      [sortBy]
   )

   const isActiveSort = useCallback(
      (field: "title" | "date" | "registrations"): boolean => {
         switch (field) {
            case "title":
               return (
                  sortBy === LivestreamStatsSortOption.TITLE_ASC ||
                  sortBy === LivestreamStatsSortOption.TITLE_DESC
               )
            case "date":
               return (
                  sortBy === LivestreamStatsSortOption.START_ASC ||
                  sortBy === LivestreamStatsSortOption.START_DESC
               )
            case "registrations":
               return (
                  sortBy === LivestreamStatsSortOption.REGISTRATIONS_ASC ||
                  sortBy === LivestreamStatsSortOption.REGISTRATIONS_DESC
               )
            default:
               return false
         }
      },
      [sortBy]
   )

   const value = useMemo<EventsViewContextValue>(
      () => ({
         sortBy,
         setSortBy,
         handleTableSort,
         getSortDirection,
         isActiveSort,
      }),
      [sortBy, setSortBy, handleTableSort, getSortDirection, isActiveSort]
   )

   return (
      <EventsViewContext.Provider value={value}>
         {children}
      </EventsViewContext.Provider>
   )
}

export const useEventsView = (): EventsViewContextValue => {
   const context = useContext(EventsViewContext)
   if (!context) {
      throw new Error("useEventsView must be used within an EventsViewProvider")
   }
   return context
}
