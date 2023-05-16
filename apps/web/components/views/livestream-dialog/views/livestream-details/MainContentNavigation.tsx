import * as React from "react"
import { FC, ReactNode, useEffect, useMemo, useState } from "react"
import { useInView } from "react-intersection-observer"
import Box from "@mui/material/Box"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import { sxStyles } from "../../../../../types/commonTypes"

const styles = sxStyles({
   tabs: {
      position: "sticky",
      top: 0,
      zIndex: 1,
      "& .MuiTabs-scroller": {
         bgcolor: "background.paper",
         borderBottom: "1px solid #F0F0F0",
      },
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
   entry: IntersectionObserverEntry
   inView?: boolean
}

const MainContentNavigation: FC<Props> = ({ children }) => {
   const [value, setValue] = useState("jobs")
   const [jobsRef, jobsInView, jobSection] = useInView()
   const [aboutLivestreamRef, aboutLivestreamsInView, aboutLivestreamSection] =
      useInView()
   const [aboutCompanyRef, aboutCompanyInView, aboutCompanySection] =
      useInView()
   const [questionsRef, questionsInView, questionsSection] = useInView()

   const tabs = useMemo<TabElement[]>(() => {
      const newTabs: TabElement[] = []

      if (jobSection) {
         newTabs.push({
            value: "jobs",
            label: "Linked Jobs",
            entry: jobSection,
            inView: jobsInView,
         })
      }

      if (aboutLivestreamSection) {
         newTabs.push({
            value: "aboutLivestream",
            label: "About The Livestream",
            entry: aboutLivestreamSection,
            inView: aboutLivestreamsInView,
         })
      }

      if (aboutCompanySection) {
         newTabs.push({
            value: "aboutCompany",
            label: "About The Company",
            entry: aboutCompanySection,
            inView: aboutCompanyInView,
         })
      }

      if (questionsSection) {
         newTabs.push({
            value: "questions",
            label: "Questions",
            entry: questionsSection,
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

      // Scroll to the selected section
      sectionRefs[newValue]?.target.scrollIntoView({
         behavior: "auto",
      })
   }

   // Listen for changes in which section is in view, and update the tab value accordingly
   useEffect(() => {
      console.count("MainContentNavigation useEffect")
      for (const tab of tabs) {
         if (tab.inView) {
            setValue(tab.value)
            break
         }
      }
   }, [tabs])

   return (
      <Box sx={styles.root}>
         <Tabs
            value={value}
            onChange={handleChange}
            aria-label="content navigation tabs"
            sx={styles.tabs}
            centered
            textColor="secondary"
            indicatorColor="secondary"
         >
            {tabs.map((tab) => (
               <Tab
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
