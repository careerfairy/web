import * as React from "react"
import { FC, ReactNode, useCallback, useEffect, useMemo, useState } from "react"
import { IntersectionOptions, useInView } from "react-intersection-observer"
import Box from "@mui/material/Box"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import { sxStyles } from "../../../../../types/commonTypes"
import { useTheme } from "@mui/material/styles"
import { useMediaQuery } from "@mui/material"

const styles = sxStyles({
   tabs: {
      position: "sticky",
      top: 0,
      zIndex: 2,
      bgcolor: "background.paper",
      borderBottom: "1px solid #F0F0F0",
   },
   tab: {
      fontSize: "1rem",
      fontWeight: 600,
      color: "#000",
      textTransform: "none",
   },
})

export type InViewRef = ReturnType<typeof useInView>["0"]

type Props = {
   hasJobs: boolean
   children: (params: {
      jobsRef: InViewRef
      aboutLivestreamRef: InViewRef
      aboutCompanyRef: InViewRef
      questionsRef: InViewRef
   }) => ReactNode
}

type TabElement = {
   value: string
   label: string
   inView: boolean
}

const options: IntersectionOptions = {
   threshold: 0.8,
}

const MainContentNavigation: FC<Props> = ({ children, hasJobs }) => {
   const theme = useTheme()
   const centeredNav = !useMediaQuery(theme.breakpoints.down("sm"))

   const [value, setValue] = useState(hasJobs ? "jobs" : "aboutLivestream")
   const [isManualTabChange, setIsManualTabChange] = useState(false)

   const [jobsRef, jobsInView, jobSection] = useInView(options)
   const [aboutLivestreamRef, aboutLivestreamsInView, aboutLivestreamSection] =
      useInView(options)
   const [aboutCompanyRef, aboutCompanyInView, aboutCompanySection] =
      useInView(options)
   const [questionsRef, questionsInView, questionsSection] = useInView(options)

   const tabs = useMemo<TabElement[]>(() => {
      const newTabs: TabElement[] = [
         // If there are jobs, make sure they are first in the list
         ...(hasJobs
            ? [
                 {
                    value: "jobs",
                    label: "Linked Jobs",
                    inView: jobsInView,
                 },
              ]
            : []),
         {
            value: "aboutLivestream",
            label: "About The Live Stream",
            inView: aboutLivestreamsInView,
         },
         ...(aboutCompanySection
            ? [
                 {
                    value: "aboutCompany",
                    label: "About The Company",
                    inView: aboutCompanyInView,
                 },
              ]
            : []),
         {
            value: "questions",
            label: "Questions",
            inView: questionsInView,
         },
      ]

      return newTabs
   }, [
      jobsInView,
      aboutLivestreamsInView,
      aboutCompanySection,
      aboutCompanyInView,
      questionsInView,
      hasJobs,
   ])

   const sectionRefs = useMemo(
      () => ({
         jobs: jobSection,
         aboutLivestream: aboutLivestreamSection,
         aboutCompany: aboutCompanySection,
         questions: questionsSection,
      }),
      [
         jobSection,
         aboutLivestreamSection,
         aboutCompanySection,
         questionsSection,
      ]
   )

   const handleChange = useCallback(
      (event: React.SyntheticEvent, newValue: string) => {
         setIsManualTabChange(true)
         setValue(newValue)

         sectionRefs[newValue]?.target.scrollIntoView({
            behavior: "smooth", // behavior: "smooth" does not work inside a dialog
         })

         // Disable the manual tab change flag after a delay
         setTimeout(() => setIsManualTabChange(false), 1000)
      },
      [sectionRefs]
   )

   // Listen for changes in which section is in view as we scroll, and update the tab value accordingly
   useEffect(() => {
      if (isManualTabChange) {
         // Do not update the tab value if we're in the middle of a manual tab change
         return
      }

      for (const tab of tabs) {
         if (tab.inView) {
            setValue(tab.value)
         }
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [tabs, isManualTabChange])

   return (
      <Box>
         <Tabs
            value={value}
            onChange={handleChange}
            aria-label="content navigation tabs"
            sx={styles.tabs}
            textColor="secondary"
            indicatorColor="secondary"
            scrollButtons
            allowScrollButtonsMobile
            centered={centeredNav}
            variant={centeredNav ? "standard" : "scrollable"}
         >
            {tabs.map((tab) => (
               <Tab
                  onClick={() => handleChange(null, tab.value)}
                  sx={styles.tab}
                  key={tab.value}
                  value={tab.value}
                  label={tab.label}
                  id={`content-navigation-tab-${tab.value}`}
                  aria-controls={`content-navigation-tabpanel-${tab.value}`}
               />
            ))}
         </Tabs>
         {children({
            jobsRef,
            aboutLivestreamRef,
            aboutCompanyRef,
            questionsRef,
         })}
      </Box>
   )
}

export default MainContentNavigation
