import React, { createContext, useContext, useMemo } from "react"
import {
   FieldOfStudy,
   LevelOfStudy,
} from "@careerfairy/shared-lib/fieldOfStudy"
import { useFirestoreCollection } from "../../../../../custom-hook/utils/useFirestoreCollection"
import { createLookup } from "@careerfairy/shared-lib/utils"

type ITalentPoolPageContext = {
   fieldsOfStudyLookup: Record<string, string>
   levelsOfStudyLookup: Record<string, string>
}

const initialValues: ITalentPoolPageContext = {
   fieldsOfStudyLookup: {},
   levelsOfStudyLookup: {},
}

const TalentPoolPageContext =
   createContext<ITalentPoolPageContext>(initialValues)

export const TalentPoolPageProvider = ({ children }) => {
   const { data: fieldsOfStudy } = useFirestoreCollection<FieldOfStudy>(
      "fieldsOfStudy",
      queryOptions
   )
   const { data: levelsOfStudy } = useFirestoreCollection<LevelOfStudy>(
      "levelsOfStudy",
      queryOptions
   )

   const levelsOfStudyLookup = useMemo(
      () => createLookup(levelsOfStudy, "name"),
      [levelsOfStudy]
   )

   const fieldsOfStudyLookup = useMemo(
      () => createLookup(fieldsOfStudy, "name"),
      [fieldsOfStudy]
   )

   const value = useMemo<ITalentPoolPageContext>(() => {
      return {
         fieldsOfStudyLookup,
         levelsOfStudyLookup,
      }
   }, [fieldsOfStudyLookup, levelsOfStudyLookup])

   return (
      <TalentPoolPageContext.Provider value={value}>
         {children}
      </TalentPoolPageContext.Provider>
   )
}

export const useTalentPoolPageContext = () => {
   const context = useContext(TalentPoolPageContext)
   if (context === undefined) {
      throw new Error(
         "useTalentPoolPageContext must be used within a TalentPoolPageContextProvider"
      )
   }
   return context
}

const queryOptions = {
   idField: "id",
   suspense: false,
}
