import {
   FC,
   ReactNode,
   SyntheticEvent,
   useEffect,
   useMemo,
   useRef,
   useState,
} from "react"
import { useInView } from "react-intersection-observer"
import Box from "@mui/material/Box"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import { sxStyles } from "../../../../../types/commonTypes"
import { useDebounce } from "react-use"
import debounce from "lodash.debounce"

const styles = sxStyles({
   tabs: {
      position: "sticky",
      top: 0,
      zIndex: 1,
      width: "100%",
   },
   root: {},
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

const MainContentNavigation: FC<Props> = ({ children }) => {
   const [value, setValue] = useState("jobs")
   const [jobsRef, jobsInView, jobSection] = useInView({})
   const [aboutLivestreamRef, aboutLivestreamsInView, aboutLivestreamSection] =
      useInView()
   const [aboutCompanyRef, aboutCompanyInView, aboutCompanySection] =
      useInView()
   const [questionsRef, questionsInView, questionsSection] = useInView()
   console.log(
      "=>(MainContentNavigation.tsx:44) questionsSection",
      questionsSection
   )

   const tabClickRef = useRef(null) // create the ref

   // useEffect(() => {
   //    if (!tabClickRef?.current) {
   //       // check if the Tab was not clicked
   //       let sectionRef: InViewRef | undefined
   //
   //       switch (value) {
   //          case "jobs":
   //             sectionRef = jobsRef
   //             break
   //          case "aboutLivestream":
   //             sectionRef = aboutLivestreamRef
   //             break
   //          case "aboutCompany":
   //             sectionRef = aboutCompanyRef
   //             break
   //          case "questions":
   //             sectionRef = questionsRef
   //             break
   //          default:
   //             break
   //       }
   //
   //       if (sectionRef && sectionRef.current && !sectionRef.inView) {
   //          sectionRef.current.scrollIntoView(scrollOptions)
   //       }
   //    }
   //
   //    tabClickRef.current = false
   // }, [
   //    value,
   //    jobsInView,
   //    aboutLivestreamsInView,
   //    aboutCompanyInView,
   //    questionsInView,
   // ])

   const handleChange2 = (_, newValue: string) => {
      console.log("=>(MainContentNavigation.tsx:37) newValue", newValue)
      setValue(newValue)

      switch (newValue) {
         case "jobs":
            // scrollToElement(jobSection.target)
            jobSection?.target.scrollIntoView(scrollOptions)
            break
         case "aboutLivestream":
            // scrollToElement(aboutLivestreamSection.target)
            aboutLivestreamSection?.target.scrollIntoView(scrollOptions)
            break
         case "aboutCompany":
            scrollToElement(aboutCompanySection.target)
            // aboutCompanySection?.target.scrollIntoView(scrollOptions)
            break
         case "questions":
            scrollToElement(questionsSection.target)
            // questionsSection.target.scrollIntoView(scrollOptions)
            break
         default:
            break
      }

      tabClickRef.current = true // set the variable to true when a Tab is clicked
   }

   const handleChange = debounce((event, newValue) => {
      setValue(newValue)
   }, 700)

   useEffect(() => {}, [value])

   return (
      <Box sx={styles.root}>
         <Tabs
            value={value}
            onChange={handleChange}
            aria-label="content navigation tabs"
            sx={styles.tabs}
            centered
         >
            {jobSection ? <Tab value="jobs" label="Jobs" /> : null}
            {aboutLivestreamSection ? (
               <Tab value="aboutLivestream" label="About Livestream" />
            ) : null}
            {aboutCompanySection ? (
               <Tab value="aboutCompany" label="About Company" />
            ) : null}
            {questionsSection ? (
               <Tab value="questions" label="Questions" />
            ) : null}
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

const tabsHeight = 48

const scrollOptions: ScrollIntoViewOptions = {
   behavior: "smooth",
   block: "start",
   inline: "nearest",
   // Subtract the tabsHeight from the top offset
   // to account for the height of the tabs
}

const scrollToElement = (element: Element | null) => {
   if (element) {
      const rect = element.getBoundingClientRect()
      const top = rect.top + window.scrollY - tabsHeight

      window.scrollTo({
         top,
         behavior: "auto",
      })
   }
}

export default MainContentNavigation
