import React, { useEffect, useState } from "react"
import { alpha } from "@mui/material/styles"
import { Tab, Tabs } from "@mui/material"
import debounce from "lodash.debounce"
import Link from "materialUI/NextNavLink"
import SectionContainer from "../common/Section/Container"

const styles = {
   root: {
      position: "sticky !important",
      top: 0,
      zIndex: (theme) => theme.zIndex.appBar,
   },
   tabs: {
      backgroundColor: (theme) => theme.palette.background.default,
      borderRadius: (theme) => theme.spacing(0, 0, 0.5, 0.5),
      width: "100%",
      borderBottom: (theme) =>
         `1px solid ${alpha(theme.palette.text.secondary, 0.1)}`,
   },
   navLink: {
      textDecoration: "none !important",
   },
}

const Navigation = ({ aboutRef, questionsRef, speakersRef }) => {
   const [value, setValue] = useState("about")
   const [tabs, setTabs] = useState([])

   useEffect(() => {
      const newTabs = [
         { ref: aboutRef, label: "About", value: aboutRef.current?.id },
         {
            ref: speakersRef,
            label: "Speakers",
            value: speakersRef.current?.id,
         },
         {
            ref: questionsRef,
            label: "Questions",
            value: questionsRef.current?.id,
         },
      ].filter(({ ref }) => ref.current)
      setTabs(newTabs)
   }, [aboutRef.current, questionsRef.current, speakersRef.current])

   useEffect(() => {
      if (!"IntersectionObserver" in window) {
         // this browser doesn't seem to support the IntersectionObserver API, do nothing
         return
      }

      let observer
      if (tabs.length) {
         const options = {
            threshold: 0.5,
         }
         observer = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
               const entryId = entry.target.id
               if (entry.isIntersecting) {
                  handleChange(_, entryId)
               }
            })
         }, options)
         tabs.forEach((tab) => observer.observe(tab.ref.current))
      }
      return () => observer?.disconnect()
   }, [tabs])

   const handleChange = debounce((event, newValue) => {
      setValue(newValue)
   }, 700)

   if (!tabs.length) {
      return null
   }

   return (
      <SectionContainer maxWidth="lg" sx={styles.root}>
         <Tabs
            value={value}
            onChange={handleChange}
            sx={styles.tabs}
            aria-label="upcoming event nav"
            centered
            textColor="secondary"
            indicatorColor="secondary"
            variant="fullWidth"
         >
            {tabs.map((tab) => (
               <Tab
                  label={tab.label}
                  id={`upcoming-event-nav-link-${tab.value}`}
                  sx={styles.navLink}
                  value={tab.value}
                  component={Link}
                  href={{ hash: `#${tab.value}` }}
                  key={tab.value}
               />
            ))}
         </Tabs>
      </SectionContainer>
   )
}

export default Navigation
