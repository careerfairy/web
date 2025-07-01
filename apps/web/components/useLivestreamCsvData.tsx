import {
   LivestreamEvent,
   LivestreamUserAction,
} from "@careerfairy/shared-lib/livestreams"
import { CSVDownloadUserData } from "@careerfairy/shared-lib/users"
import RegisteredUsersIcon from "@mui/icons-material/People"
import { CircularProgress } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import StatsUtil from "data/util/StatsUtil"
import { useCallback, useEffect, useMemo, useState } from "react"
import { livestreamRepo } from "../data/RepositoryInstances"
import { useGroup } from "../layouts/GroupDashboardLayout"
import { errorLogAndNotify } from "../util/CommonUtil"
import { CSVDialogDownload } from "./custom-hook/useMetaDataActions"
import ButtonWithHint from "./views/group/admin/events/events-table/ButtonWithHint"

interface MetaDataActionsProps {
   // The type of user we are downloading data for
   userType: LivestreamUserAction
   // Whether the user can download the csv
   canDownload?: boolean
   // The target stream we are downloading data for
   targetStream?: LivestreamEvent
}

export function useLivestreamCsvData({
   userType,
   canDownload,
   targetStream,
}: MetaDataActionsProps) {
   const title = getTitle(userType)
   const description = getDescription(userType)

   const { groupPresenter, groupQuestions, group } = useGroup()

   const theme = useTheme()

   // Dictionary of livestreams to their respective csv data
   const [userDataDictionary, setUserDataDictionary] = useState<
      Record<string, CSVDownloadUserData[]>
   >({})

   // Dictionary of loading states for each stream
   const [loadingData, setLoadingData] = useState<Record<string, boolean>>({})

   // useTraceUpdate({
   //    targetStream,
   //    groupQuestions,
   //    userType,
   //    group,
   //    groupPresenter,
   // })
   useEffect(() => {
      if (targetStream) {
         const fetchUsers = async () => {
            setLoadingData((prevState) => ({
               ...prevState,
               [targetStream.id]: true,
            }))
            const targetUsers = userDataDictionary[targetStream.id]
            try {
               if (!targetUsers) {
                  const users = await livestreamRepo.getLivestreamUsers(
                     targetStream.id,
                     userType
                  )

                  const csvData = StatsUtil.getCsvData(
                     group,
                     targetStream,
                     users,
                     groupQuestions
                  )
                  setUserDataDictionary({
                     ...userDataDictionary,
                     [targetStream.id]: csvData,
                  })
               }
            } catch (e) {
               errorLogAndNotify(e, {
                  message: "Failed to fetch livestream users for csv",
                  targetStream,
                  userType,
                  group,
               })
            }
            setLoadingData((prevState) => ({
               ...prevState,
               [targetStream.id]: false,
            }))
         }
         fetchUsers()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [targetStream, groupQuestions, userType, group, groupPresenter])

   const action = useCallback(
      (rowData) => {
         const actionLoading = loadingData[rowData?.id]
         const targetUserData = userDataDictionary[rowData?.id]
         const canDownloadUserData = Boolean(canDownload)
         const hintTitle = `Download ${title}`

         const noUsers = !targetUserData && !actionLoading

         return {
            icon: actionLoading ? (
               <CircularProgress size={15} color="inherit" />
            ) : (
               <RegisteredUsersIcon color="action" />
            ),
            hintTitle,
            hintDescription: description,
            tooltip: targetUserData
               ? `Download ${title}`
               : actionLoading
               ? `Getting ${title}...`
               : `Get ${title}`,
            onClick: () => {},
            hidden: !canDownloadUserData || noUsers,
            disabled: actionLoading || !canDownloadUserData,
            loadedButton: targetUserData && (
               <CSVDialogDownload
                  title={hintTitle}
                  data={targetUserData}
                  filename={`${title} ${rowData?.company} ${rowData?.id}.csv`}
               >
                  <ButtonWithHint
                     startIcon={<RegisteredUsersIcon color="action" />}
                     hintTitle={hintTitle}
                     style={{
                        marginTop: theme.spacing(0.5),
                     }}
                     hintDescription={description}
                  >
                     Download {title}
                  </ButtonWithHint>
               </CSVDialogDownload>
            ),
         }
      },
      [loadingData, userDataDictionary, canDownload, title, description, theme]
   )

   const getNumberOfUsers = useCallback(
      (rowData) => {
         const targetUserData = userDataDictionary?.[rowData?.id]
         return targetUserData?.length
      },
      [userDataDictionary]
   )

   return useMemo(
      () => ({ action, getNumberOfUsers }),
      [action, getNumberOfUsers]
   )
}

const getTitle = (userType: LivestreamUserAction) => {
   switch (userType) {
      case "talentPool":
         return "Talent Pool"
      case "jobApplications":
         return "Job Applicants"
      case "registered":
         return "Registered Users"
      case "participated":
         return "Participants"
      default:
         return "Users"
   }
}

const getDescription = (userType: LivestreamUserAction) => {
   switch (userType) {
      case "talentPool":
         return "Download a CSV with the details of the students who opted to put themselves in the talent pool"
      case "jobApplications":
         return "Download a CSV with the details of the students who applied for a job"
      case "registered":
         return "Download a CSV with the details of the students who registered to your event"
      case "participated":
         return "Download a CSV with the details of the students who participated in your event"
      default:
         return "Download a CSV with the details of the students who joined your event"
   }
}
