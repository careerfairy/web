import {
   CustomJob,
   CustomJobApplicationSource,
   CustomJobApplicationSourceTypes,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { CloseOutlined } from "@mui/icons-material"
import { Box, IconButton } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import CustomJobDetailsDialog from "components/views/common/jobs/CustomJobDetailsDialog"
import { useRouter } from "next/router"
import {
   ReactNode,
   createContext,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   profilePaperProps: {
      position: "fixed", // Fix the dialog at the bottom of the screen
      bottom: 0, // Align it to the bottom
      left: 0, // Ensure it starts from the left side of the screen
      right: 0, // Ensure it spans the entire width
      margin: "0", // Remove any external margin
      width: "100%", // Full width on mobile
      maxHeight: "85vh", // Allow content to dictate the height
      height: "auto", // Dynamically adjust the height based on content
      borderRadius: "12px 12px 0 0", // Optional rounded corners at the top
   },
})

export const DIALOG_JOB_ID_QUERY_PARAM = "dialogJobId" as const

export type CustomJobDialogContextType = {
   handleJobDialogOpen: (jobId: string) => void
   handleJobDialogClose: () => void
   currentJobIdInDialog: string
   setCurrentJobIdInDialog: (jobId: string) => void
   getJobDialogKey: () => string
   isJobDialogOpen: boolean
}

const CustomJobDialogContext = createContext<
   CustomJobDialogContextType | undefined
>(undefined)

type CustomJobDialogProviderProps = {
   children: ReactNode
   source: CustomJobApplicationSource
   serverSideCustomJob?: CustomJob
   hideApplicationConfirmation?: boolean
   customJobId?: string
}

export const CustomJobDialogProvider = ({
   children,
   source,
   serverSideCustomJob,
   customJobId,
   hideApplicationConfirmation,
}: CustomJobDialogProviderProps) => {
   const isMobile = useIsMobile()
   const router = useRouter()
   const isJobDialogOpen = Boolean(router.query[DIALOG_JOB_ID_QUERY_PARAM])

   const [currentJobIdInDialog, setCurrentJobIdInDialog] =
      useState<string>(undefined)

   // This is used to force a re-render of the dialog when the live stream id is the same
   // on nested live stream cards. Example: speaker details with same live stream card on
   // linked content section.
   const [jobDialogKey, setJobDialogKey] = useState<string>(undefined)

   const handleJobDialogOpen = useCallback(
      (newJobId: string) => {
         if (currentJobIdInDialog === newJobId) {
            setJobDialogKey(`${currentJobIdInDialog}-${Date.now()}`)
         } else {
            setJobDialogKey(undefined)
         }

         void router.push(
            {
               pathname: router.pathname,
               query: {
                  ...router.query,
                  [DIALOG_JOB_ID_QUERY_PARAM]: newJobId,
               },
            },
            undefined,
            {
               scroll: false,
               shallow: true,
            }
         )
      },
      [currentJobIdInDialog, router]
   )

   const handleJobDialogClose = useCallback(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [DIALOG_JOB_ID_QUERY_PARAM]: dialogJobId, ...restOfQuery } =
         router.query

      setJobDialogKey(undefined)
      setCurrentJobIdInDialog(undefined)
      void router.push(
         {
            pathname: router.pathname,
            query: restOfQuery,
         },
         undefined,
         {
            scroll: false,
            shallow: true,
         }
      )
   }, [router])

   const getJobDialogKey = useCallback(() => {
      return jobDialogKey || currentJobIdInDialog
   }, [jobDialogKey, currentJobIdInDialog])

   useEffect(() => {
      const queryParamJobId = router.query[DIALOG_JOB_ID_QUERY_PARAM] as string

      if (queryParamJobId) {
         if (jobDialogKey === queryParamJobId) {
            setJobDialogKey(`${queryParamJobId}-${Date.now()}`)
         } else {
            setJobDialogKey(undefined)
         }
         setCurrentJobIdInDialog(queryParamJobId)
      }
   }, [router.query, setCurrentJobIdInDialog, isJobDialogOpen, jobDialogKey])

   const contextValue = useMemo(
      () => ({
         isJobDialogOpen,
         handleJobDialogOpen: handleJobDialogOpen,
         handleJobDialogClose: handleJobDialogClose,
         currentJobIdInDialog: currentJobIdInDialog,
         setCurrentJobIdInDialog: setCurrentJobIdInDialog,
         getJobDialogKey: getJobDialogKey,
      }),
      [
         isJobDialogOpen,
         handleJobDialogOpen,
         handleJobDialogClose,
         currentJobIdInDialog,
         setCurrentJobIdInDialog,
         getJobDialogKey,
      ]
   )

   const hasPaperProps = Boolean(
      (source.source == CustomJobApplicationSourceTypes.Profile ||
         source.source == CustomJobApplicationSourceTypes.Portal) &&
         isMobile
   )

   return (
      <CustomJobDialogContext.Provider value={contextValue}>
         {children}
         <CustomJobDetailsDialog
            serverSideCustomJob={serverSideCustomJob}
            customJobId={customJobId}
            isOpen={isJobDialogOpen}
            onClose={handleJobDialogClose}
            source={source}
            heroContent={
               !isMobile ? (
                  <Box
                     display={"flex"}
                     flexDirection={"row-reverse"}
                     p={0}
                     m={0}
                  >
                     <IconButton onClick={handleJobDialogClose}>
                        <CloseOutlined />
                     </IconButton>
                  </Box>
               ) : null
            }
            heroSx={{ m: 0, py: "0px !important", px: "10px !important" }}
            paperPropsSx={hasPaperProps ? styles.profilePaperProps : null}
            hideApplicationConfirmation={hideApplicationConfirmation}
         />
      </CustomJobDialogContext.Provider>
   )
}

export const useCustomJobDialog = () => {
   return useContext(CustomJobDialogContext)
}
