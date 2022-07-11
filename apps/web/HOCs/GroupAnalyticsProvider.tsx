import React, { createContext, useContext, useEffect, useState } from "react"
import { FieldOfStudy } from "@careerfairy/shared-lib/dist/fieldOfStudy"
import {
   useFieldsOfStudy,
   useLevelsOfStudy,
} from "../components/custom-hook/useCollection"
import { Identifiable } from "../types/commonTypes"
import { LevelOfStudy } from "@careerfairy/shared-lib/dist/levelOfStudy"

type DefaultContext = {
   fieldsOfStudy: FieldOfStudy[]
   levelsOfStudy: LevelOfStudy[]
   fieldsOfStudyById: Record<string, FieldOfStudy["name"]>
   levelsOfStudyById: Record<string, LevelOfStudy["name"]>
}
const AnalyticsContext = createContext<DefaultContext>({
   fieldsOfStudy: [],
   levelsOfStudy: [],
   fieldsOfStudyById: {},
   levelsOfStudyById: {},
})

const convertFirebaseDocsToDictionary = <T extends Identifiable>(
   array: T[]
): Record<string, T> => {
   return array.reduce<Record<string, T>>((acc, curr) => {
      acc[curr.id] = curr
      return acc
   }, {})
}

const createDictionary = <T extends Identifiable>(
   array: T[],
   propertyName: keyof T
): Record<string, T[keyof T]> => {
   return array.reduce((acc, curr) => {
      acc[curr.id] = curr[propertyName]
      return acc
   }, {})
}

const GroupAnalyticsProvider = ({ children }) => {
   const [fieldsOfStudyById, setFieldsOfStudyById] = useState({})
   const [levelsOfStudyById, setLevelsOfStudyById] = useState({})
   const { data: fieldsOfStudy } = useFieldsOfStudy(true)
   const { data: levelsOfStudy } = useLevelsOfStudy(true)

   useEffect(() => {
      setFieldsOfStudyById(createDictionary(fieldsOfStudy, "name"))
      setLevelsOfStudyById(createDictionary(levelsOfStudy, "name"))
   }, [fieldsOfStudy, levelsOfStudy])

   return (
      <AnalyticsContext.Provider
         value={{
            fieldsOfStudy,
            fieldsOfStudyById,
            levelsOfStudy,
            levelsOfStudyById,
         }}
      >
         {children}
      </AnalyticsContext.Provider>
   )
}

const useGroupAnalytics = () => useContext<DefaultContext>(AnalyticsContext)

export { GroupAnalyticsProvider, useGroupAnalytics }
