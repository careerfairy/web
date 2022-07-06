import React, { createContext, useContext, useEffect, useState } from "react"
import { FieldOfStudy } from "@careerfairy/shared-lib/dist/fieldOfStudy"
import fieldOfStudyRepo from "../data/firebase/FieldOfStudyRepository"

type DefaultContext = {
   fieldsOfStudy: FieldOfStudy[]
   fieldsOfStudyById: { [docId: string]: FieldOfStudy }
}
const AnalyticsContext = createContext<DefaultContext>({
   fieldsOfStudy: null,
   fieldsOfStudyById: {},
})

const AnalyticsProvider = ({ children }) => {
   const [fieldsOfStudy, setFieldsOfStudy] = useState(null)
   const [fieldsOfStudyById, setFieldsOfStudyById] = useState({})

   useEffect(() => {
      ;(async function () {
         try {
            const fieldsOfStudy = await fieldOfStudyRepo.getAllFieldsOfStudy()
            //setFieldsOfStudyById
            const fieldsOfStudyById = fieldsOfStudy.reduce<{
               [docId: string]: FieldOfStudy
            }>((acc, curr) => {
               acc[curr.id] = curr
               return acc
            }, {})
            setFieldsOfStudyById(fieldsOfStudyById)
            setFieldsOfStudy(fieldsOfStudy)
         } catch (error) {
            console.error(error)
         }
      })()
   }, [])

   return (
      <AnalyticsContext.Provider
         value={{
            fieldsOfStudy,
            fieldsOfStudyById,
         }}
      >
         {children}
      </AnalyticsContext.Provider>
   )
}

const useAnalytics = () => useContext<DefaultContext>(AnalyticsContext)

export { AnalyticsProvider, useAnalytics }
