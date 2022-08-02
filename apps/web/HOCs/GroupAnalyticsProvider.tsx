import React, { createContext, useContext } from "react"
import { FieldOfStudy } from "@careerfairy/shared-lib/dist/fieldOfStudy"
import {
   useFieldsOfStudy,
   useLevelsOfStudy,
} from "../components/custom-hook/useCollection"
import { LevelOfStudy } from "@careerfairy/shared-lib/dist/levelOfStudy"

type DefaultContext = {
   fieldsOfStudy: FieldOfStudy[]
   levelsOfStudy: LevelOfStudy[]
}
const AnalyticsContext = createContext<DefaultContext>({
   fieldsOfStudy: [],
   levelsOfStudy: [],
})

const GroupAnalyticsProvider = ({ children }) => {
   const { data: fieldsOfStudy } = useFieldsOfStudy(true)
   const { data: levelsOfStudy } = useLevelsOfStudy(true)

   return (
      <AnalyticsContext.Provider
         value={{
            fieldsOfStudy,
            levelsOfStudy,
         }}
      >
         {children}
      </AnalyticsContext.Provider>
   )
}

const useGroupAnalytics = () => useContext<DefaultContext>(AnalyticsContext)

export { GroupAnalyticsProvider, useGroupAnalytics }
