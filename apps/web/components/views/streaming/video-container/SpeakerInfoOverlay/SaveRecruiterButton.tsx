import { SavedRecruiter } from "@careerfairy/shared-lib/dist/users"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import SaveIcon from "@mui/icons-material/Save"
import LoadingButton from "@mui/lab/LoadingButton"
import { Tooltip } from "@mui/material"
import Box from "@mui/material/Box"
import pick from "lodash/pick"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { useCurrentStream } from "../../../../../context/stream/StreamContext"
import { dataLayerEvent } from "../../../../../util/analyticsUtils"
import { SaveRecruiterButtonNoAccess } from "./SaveRecruiterButtonNoAccess"
import useRecruiterData from "./useRecruiterData"

export const SaveRecruiterButton = ({ speaker }) => {
   const { userPresenter, isLoggedOut } = useAuth()
   const { currentLivestream } = useCurrentStream()
   const { isLoading, recruiterData, saveRecruiter, recruiterSaved } =
      useRecruiterData(speaker.id)

   let tooltipMessage =
      "The speaker details will be saved on the My Recruiters page under your profile."

   const isAlreadySaved = Boolean(recruiterData || recruiterSaved)

   if (isAlreadySaved) {
      tooltipMessage = "This Speaker is already on your saved list."
   }

   if (isLoggedOut) {
      tooltipMessage = "You must be logged in to save a speaker."
   }

   if (!userPresenter?.canSaveRecruiters()) {
      return <SaveRecruiterButtonNoAccess />
   }

   const onClick = () => {
      const recruiter: SavedRecruiter = createSavedRecruiter(
         userPresenter.model.id,
         currentLivestream,
         speaker
      )

      saveRecruiter(recruiter).catch(console.error)
      dataLayerEvent("livestream_speaker_save")
   }

   const isButtonDisabled = Boolean(
      isLoading || !userPresenter?.canSaveRecruiters()
   )

   return (
      <>
         <LoadingButton
            color="secondary"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={isButtonDisabled || isAlreadySaved}
            onClick={onClick}
            loading={isLoading}
            sx={{
               boxShadow: "0px 3px 6px rgba(116, 49, 226, 0.5)",
            }}
         >
            {isAlreadySaved ? "Saved" : "Save Speaker"}
         </LoadingButton>

         <Tooltip title={tooltipMessage}>
            <Box ml={2} sx={{ marginTop: "4px" }}>
               <InfoOutlinedIcon />
            </Box>
         </Tooltip>
      </>
   )
}

const createSavedRecruiter = (userId, currentLivestream, speaker) => {
   const recruiterInfo: SavedRecruiter = {
      id: speaker.id,
      livestreamId: currentLivestream.id,
      userId: userId,
      savedAt: null, // will be set by the server

      livestreamDetails: pick(currentLivestream, [
         "title",
         "company",
         "summary",
         "start",
         "companyLogoUrl",
      ]),

      streamerDetails: pick(speaker, [
         "linkedIn",
         "firstName",
         "lastName",
         "position",
         "id",
         "avatar",
         "background",
      ]),
   }

   return recruiterInfo
}
