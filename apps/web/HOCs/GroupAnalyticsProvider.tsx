import { FieldOfStudy } from "@careerfairy/shared-lib/fieldOfStudy"
import { createContext, useContext, useMemo } from "react"
import {
   useFieldsOfStudy,
   useLevelsOfStudy,
} from "../components/custom-hook/useCollection"

type DefaultContext = {
   fieldsOfStudy: FieldOfStudy[]
   levelsOfStudy: FieldOfStudy[]
}
const AnalyticsContext = createContext<DefaultContext>({
   fieldsOfStudy: [],
   levelsOfStudy: [],
})

const GroupAnalyticsProvider = ({ children }) => {
   const { data: fieldsOfStudy } = useFieldsOfStudy(true)
   const { data: levelsOfStudy } = useLevelsOfStudy(true)

   const value = useMemo(() => {
      return {
         fieldsOfStudy,
         levelsOfStudy,
      }
   }, [fieldsOfStudy, levelsOfStudy])

   return (
      <AnalyticsContext.Provider value={value}>
         {children}
      </AnalyticsContext.Provider>
   )
}

const useGroupAnalytics = () => useContext<DefaultContext>(AnalyticsContext)

export { GroupAnalyticsProvider, useGroupAnalytics }
