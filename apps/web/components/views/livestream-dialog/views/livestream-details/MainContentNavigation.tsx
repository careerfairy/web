import * as React from "react"
import { FC, ReactNode, useEffect, useMemo, useState } from "react"
import { IntersectionOptions, useInView } from "react-intersection-observer"
import Box from "@mui/material/Box"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import { sxStyles } from "../../../../../types/commonTypes"

const styles = sxStyles({
   tabs: {
      position: "sticky",
      top: 0,
      zIndex: 1,
      bgcolor: "background.paper",
      borderBottom: "1px solid #F0F0F0",
   },
   root: {},
   tab: {
      fontSize: "1rem",
      fontWeight: 600,
      color: "#000",
   },
})

type InViewRef = ReturnType<typeof useInView>["0"]

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
   const [value, setValue] = useState(hasJobs ? "jobs" : "aboutLivestream")
   const [jobsRef, jobsInView, jobSection] = useInView(options)
   const [aboutLivestreamRef, aboutLivestreamsInView, aboutLivestreamSection] =
      useInView(options)
   const [aboutCompanyRef, aboutCompanyInView, aboutCompanySection] =
      useInView(options)
   const [questionsRef, questionsInView, questionsSection] = useInView(options)

   const tabs = useMemo<TabElement[]>(() => {
      const newTabs: TabElement[] = []

      if (jobSection) {
         newTabs.push({
            value: "jobs",
            label: "Linked Jobs",
            inView: jobsInView,
         })
      }

      if (aboutLivestreamSection) {
         newTabs.push({
            value: "aboutLivestream",
            label: "About The Livestream",
            inView: aboutLivestreamsInView,
         })
      }

      if (aboutCompanySection) {
         newTabs.push({
            value: "aboutCompany",
            label: "About The Company",
            inView: aboutCompanyInView,
         })
      }

      if (questionsSection) {
         newTabs.push({
            value: "questions",
            label: "Questions",
            inView: questionsInView,
         })
      }

      return newTabs
   }, [
      jobSection,
      aboutLivestreamSection,
      aboutCompanySection,
      questionsSection,
      jobsInView,
      aboutLivestreamsInView,
      aboutCompanyInView,
      questionsInView,
   ])

   // Create a mapping from tab values to section objects
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

   const handleChange = (event: React.SyntheticEvent, newValue: string) => {
      setValue(newValue)

      sectionRefs[newValue]?.target.scrollIntoView({
         behavior: "auto", // behavior: "smooth" does not work inside a dialog
      })
   }

   // Listen for changes in which section is in view as we scroll, and update the tab value accordingly
   useEffect(() => {
      for (const tab of tabs) {
         if (tab.inView) {
            setValue(tab.value)
         }
      }
   }, [tabs, sectionRefs, value])

   return (
      <Box sx={styles.root}>
         <Tabs
            value={value}
            onChange={handleChange}
            aria-label="content navigation tabs"
            sx={styles.tabs}
            textColor="secondary"
            indicatorColor="secondary"
            scrollButtons
            allowScrollButtonsMobile
            centered
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
