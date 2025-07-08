import {
   CustomJob,
   CustomJobApplicationSource,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { Box, Stack, SxProps } from "@mui/material"
import { DefaultTheme } from "@mui/styles/defaultTheme"
import { useAuth } from "HOCs/AuthProvider"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useCustomJobApply from "components/custom-hook/custom-job/useCustomJobApply"
import useControlledTabNavigationOnScroll from "components/custom-hook/useControlledTabNavigationOnScroll"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import useIsMobile from "components/custom-hook/useIsMobile"
import { customJobRepo, userRepo } from "data/RepositoryInstances"
import { props } from "lodash/fp"
import * as React from "react"
import {
   ReactNode,
   forwardRef,
   useEffect,
   useMemo,
   useRef,
   useState,
} from "react"
import { useSelector } from "react-redux"
import { useMeasure } from "react-use"
import { AutomaticActions } from "store/reducers/sparksFeedReducer"
import { autoAction } from "store/selectors/sparksFeedSelectors"
import { errorLogAndNotify } from "util/CommonUtil"
import { AnalyticsEvents } from "util/analyticsConstants"
import { dataLayerCustomJobEvent } from "util/analyticsUtils"
import { combineStyles, sxStyles } from "../../../../../types/commonTypes"
import CustomJobApplyConfirmation from "./CustomJobApplyConfirmation"
import CustomJobCTAButtons from "./CustomJobCTAButtons"
import CustomJobHeader from "./CustomJobHeader"
import { CustomJobsContentTabs } from "./CustomJobsContentTabs"
import { TabConfig, TabId, TabsHeader } from "./TabsHeader"
import CustomJobDetailsSkeleton from "./skeletons/CustomJobDetailsSkeleton"

const responsiveBreakpoint = "md"

const customStyles = sxStyles({
   root: {
      p: {
         xs: 0,
         [responsiveBreakpoint]: 3,
      },
   },
   content: {
      mt: "24px",
   },
   fixedBottomContent: {
      position: "fixed",
      bottom: 0,
      width: "100%",
      p: 2.5,
      borderTop: "1px solid #F1F1F1",
      bgcolor: "background.paper",
      display: "flex",
   },
   noDivider: {
      borderTop: "none",
   },
   header: {
      position: "sticky",
      top: 0,
      zIndex: (theme) => theme.zIndex.appBar,
      backgroundColor: (theme) => theme.brand.white[50],
      borderTopLeftRadius: "8px",
      borderTopRightRadius: "8px",
   },
   tabsHeader: {
      position: "sticky",
      top: -1,
      backgroundColor: (theme) => theme.brand.white[50],
      zIndex: 1,
      borderTopLeftRadius: "8px",
      borderTopRightRadius: "8px",
   },
})

type Props = {
   job: CustomJob
   applicationInitiatedOnly?: boolean
   context?: CustomJobApplicationSource
   heroContent?: ReactNode
   sx?: SxProps<DefaultTheme>
   heroSx?: SxProps<DefaultTheme>
   headerSx?: SxProps<DefaultTheme>
   hideBottomDivider?: boolean
   disabledLinkedContentClick?: boolean
   handleEdit?: () => void
   onApply?: () => void
   hideCTAButtons?: boolean
   companyName?: string
   companyLogoUrl?: string
   hideLinkedLivestreams?: boolean
   hideLinkedSparks?: boolean
   suspense?: boolean
}

const TAB_CONFIG: TabConfig[] = [
   { id: "overview", label: "Job description" },
   { id: "salary", label: "Salary" },
   { id: "insidelook", label: "In their words" },
]

const CustomJobDetailsView = (props: Props) => {
   if (!props.suspense) {
      return <CustomJobDetails {...props} />
   }

   return (
      <SuspenseWithBoundary
         fallback={
            <CustomJobDetailsSkeleton heroContent={!!props.heroContent} />
         }
      >
         <CustomJobDetails
            {...props}
            companyLogoUrl={props?.job?.group?.logoUrl}
            companyName={props?.job?.group?.universityName}
         />
      </SuspenseWithBoundary>
   )
}

export const CustomJobDetails = ({
   job,
   applicationInitiatedOnly,
   handleEdit,
   companyLogoUrl,
   companyName,
   context,
   heroContent,
   disabledLinkedContentClick,
   sx,
   heroSx,
   headerSx,
   hideBottomDivider,
   hideCTAButtons,
   onApply,
   hideLinkedLivestreams,
   hideLinkedSparks,
}: Props) => {
   const { userData } = useAuth()
   const { applicationInitiatedOnly: applicationInitiated } = useCustomJobApply(
      job as PublicCustomJob,
      context
   )

   const [isOpen, handleOpen, handleClose] = useDialogStateHandler(
      applicationInitiatedOnly || applicationInitiated
   )

   const [ref, { height }] = useMeasure()

   const autoActionType = useSelector(autoAction)
   const isMobile = useIsMobile()

   // Only show tabs that have content
   const tabs = useMemo(() => {
      return TAB_CONFIG.filter((tab) => {
         if (tab.id === "salary" && !job.salary?.length) return false
         if (
            tab.id === "insidelook" &&
            !job.livestreams?.length &&
            !job.sparks?.length
         )
            return false
         return true
      })
   }, [job.salary?.length, job.livestreams?.length, job.sparks?.length])
   const isAutoApply = autoActionType === AutomaticActions.APPLY

   const scrollContainerRef = useRef<HTMLDivElement>(null)
   const sectionRefs = useRef<Array<React.RefObject<HTMLElement>>>([])
   sectionRefs.current = TAB_CONFIG.map(
      (_, i) => sectionRefs.current[i] ?? React.createRef<HTMLElement>()
   )

   const [initialTabFromHashProcessed, setInitialTabFromHashProcessed] =
      useState(false)

   const [activeTabState, setActiveTabState] = useState<TabId>(TAB_CONFIG[0].id)

   const [currentActiveTab, handleTabClickInternal] =
      useControlledTabNavigationOnScroll(sectionRefs.current, {
         initialValue: activeTabState,
         threshold: 0.1,
      })

   useEffect(() => {
      // This effect synchronizes activeTabState when currentActiveTab changes (e.g., due to scrolling)
      if (!initialTabFromHashProcessed || !currentActiveTab) {
         return // Don't do anything until initial setup is done or if currentActiveTab is not yet determined
      }

      // Sync activeTabState with the tab derived from scrolling if they differ
      if (currentActiveTab !== activeTabState) {
         setActiveTabState(currentActiveTab as TabId)
      }
   }, [currentActiveTab, activeTabState, initialTabFromHashProcessed])

   useEffect(() => {
      // This effect runs once on component mount for initial setup.
      // activeTabState is already set by useState to TAB_CONFIG[0].id.

      setInitialTabFromHashProcessed(true)

      // Force scroll to the top of the scrollable container after initial setup.
      // This ensures the view is reset to the top.
      const timerId = setTimeout(() => {
         if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: "auto" })
         } else if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "auto" })
         }
      }, 0)

      return () => clearTimeout(timerId)
   }, []) // Empty dependency array ensures this runs only once on mount

   const handleTabChange = (event: React.SyntheticEvent, newValue: TabId) => {
      if (activeTabState === newValue) return

      setActiveTabState(newValue)

      // Scroll to the corresponding section
      const element = document.getElementById(newValue)
      if (element && scrollContainerRef.current) {
         element.scrollIntoView({ behavior: "smooth", block: "start" })
      }

      // Notify the useControlledTabNavigationOnScroll hook about the explicit tab change
      handleTabClickInternal(event, newValue)
   }

   useEffect(() => {
      customJobRepo
         .incrementCustomJobViews(job.id)
         .then(() =>
            dataLayerCustomJobEvent(
               AnalyticsEvents.CustomJobView,
               job,
               companyName
            )
         )
         .catch(() => {
            errorLogAndNotify(
               new Error("Failed to increment custom job views"),
               {
                  jobId: job.id,
                  userId: userData?.authId,
                  eventName: AnalyticsEvents.CustomJobView,
               }
            )
         })

      if (userData?.authId) {
         userRepo.updateUserLastViewedJob(job, userData?.authId)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [job.id])

   return (
      <>
         {heroContent ? (
            <Box sx={combineStyles(customStyles.root, heroSx)}>
               {heroContent}
            </Box>
         ) : null}
         <Stack spacing={4.75} sx={combineStyles(customStyles.root, sx)}>
            <Box>
               <Box sx={headerSx}>
                  <CustomJobHeader
                     job={job}
                     companyName={companyName}
                     companyLogoUrl={companyLogoUrl}
                     editMode={!!handleEdit}
                     handleClick={handleEdit}
                  />
               </Box>
               <Box sx={customStyles.tabsHeader}>
                  <TabsHeader
                     tabsConfig={tabs}
                     activeTab={activeTabState}
                     onTabChange={handleTabChange}
                  />
               </Box>
               <CustomJobsContentTabs
                  tabsConfig={tabs}
                  scrollContainerRef={scrollContainerRef}
                  sectionRefs={sectionRefs}
                  hideLinkedLivestreams={hideLinkedLivestreams}
                  hideLinkedSparks={hideLinkedSparks}
                  disabledLinkedContentClick={disabledLinkedContentClick}
               />
            </Box>
            {!hideCTAButtons && context && isOpen ? (
               <CustomJobApplyConfirmation
                  handleClose={handleClose}
                  job={job as PublicCustomJob}
                  applicationSource={context}
                  autoApply={isAutoApply}
                  onApply={onApply}
                  sx={{
                     bottom:
                        isMobile && context.source == "livestream"
                           ? "150px"
                           : "100px",
                  }}
               />
            ) : null}
         </Stack>
         {!hideCTAButtons && context ? (
            <>
               <CustomJobCTABottomContent
                  hideBottomDivider={hideBottomDivider}
                  ref={ref}
               >
                  <CustomJobCTAButtons
                     applicationSource={context}
                     job={job as PublicCustomJob}
                     handleApplyClick={handleOpen}
                     {...props}
                  />
               </CustomJobCTABottomContent>
               <Box height={`calc(${height}px + 40px)`} />
            </>
         ) : null}
      </>
   )
}

type CustomJobCTABottomContentProps = {
   children: ReactNode
   hideBottomDivider: boolean
}

export const CustomJobCTABottomContent = forwardRef<
   HTMLDivElement,
   CustomJobCTABottomContentProps
>(function CustomJobCTABottomContent({ children, hideBottomDivider }, ref) {
   return (
      <Box
         ref={ref}
         sx={[
            customStyles.fixedBottomContent,
            hideBottomDivider && customStyles.noDivider,
         ]}
      >
         {children}
      </Box>
   )
})

export default CustomJobDetailsView
