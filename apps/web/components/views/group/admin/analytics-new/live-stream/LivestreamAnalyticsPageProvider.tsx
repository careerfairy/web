import React, { createContext, FC, useContext, useMemo, useState } from "react"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { FieldOfStudy } from "@careerfairy/shared-lib/fieldOfStudy"
import { useFirestoreCollection } from "../../../../../custom-hook/utils/useFirestoreCollection"
import { createLookup } from "@careerfairy/shared-lib/utils"
import { useFirestoreDocument } from "../../../../../custom-hook/utils/useFirestoreDocument"

type ILivestreamAnalyticsPageContext = {
   /**
    * Loading status:
    *  undefined => still loading
    *  null => no data
    */
   currentStreamStats: LiveStreamStats | undefined | null
   userType: "registrations" | "participants"
   fieldsOfStudyLookup: Record<string, string>
}

const initialUserType: ILivestreamAnalyticsPageContext["userType"] =
   "registrations"

const initialValues: ILivestreamAnalyticsPageContext = {
   currentStreamStats: undefined,
   userType: initialUserType,
   fieldsOfStudyLookup: {},
}

const LivestreamAnalyticsPageContext =
   createContext<ILivestreamAnalyticsPageContext>(initialValues)

export const LivestreamAnalyticsPageProvider = ({ children }) => {
   const [userType, setUserType] =
      useState<ILivestreamAnalyticsPageContext["userType"]>(initialUserType)

   const { data: fieldsOfStudy } = useFirestoreCollection<FieldOfStudy>(
      "fieldsOfStudy",
      queryOptions
   )

   /**
    * We only want to fetch the livestream stats in the livestream analytics page and
    *
    * */
   const { data: currentStreamStats } = useFirestoreDocument<LiveStreamStats>(
      "livestreams",
      [router.query.livestreamId as string, "stats", "livestreamStats"],
      {
         idField: "id",
         suspense: false,
      }
   )
   const fieldsOfStudyLookup = useMemo(
      () => createLookup(fieldsOfStudy, "name"),
      [fieldsOfStudy]
   )

   const value = useMemo<ILivestreamAnalyticsPageContext>(() => {
      return {
         fieldsOfStudyLookup,
         currentStreamStats,
         userType,
      }
   }, [currentStreamStats, fieldsOfStudyLookup, userType])

   return (
      <LivestreamAnalyticsPageContext.Provider value={value}>
         {children}
      </LivestreamAnalyticsPageContext.Provider>
   )
}

export const useLivestreamsAnalyticsPageContext = () => {
   const context = useContext(LivestreamAnalyticsPageContext)
   if (context === undefined) {
      throw new Error(
         "useLivestreamsAnalyticsPageContext must be used within a LivestreamAnalyticsPageContextProvider"
      )
   }
   return context
}

const queryOptions = {
   idField: "id",
   suspense: false,
}
