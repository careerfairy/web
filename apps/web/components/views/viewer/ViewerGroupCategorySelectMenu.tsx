import React from "react"
import makeStyles from "@mui/styles/makeStyles"
import { Box } from "@mui/material"
import RegistrationModal from "../common/registration-modal"
import {
   LivestreamEvent,
   LivestreamGroupQuestionsMap,
} from "@careerfairy/shared-lib/dist/livestreams"
import { Group } from "@careerfairy/shared-lib/dist/groups"

const useStyles = makeStyles((theme) => ({
   root: {
      height: "100vh",
      width: "100vw",
      background: theme.palette.primary.main,
   },
   container: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
   },
   contentWrapper: {
      display: "flex",
      flexDirection: "column",
   },
}))

interface Props {
   joinGroupModalData?: {
      groups: Group[]
      livestream: LivestreamEvent
   }
   onQuestionsAnswered: (...any) => void
}
const ViewerGroupCategorySelectMenu = ({
   joinGroupModalData,
   onQuestionsAnswered,
}: Props) => {
   const classes = useStyles()

   return (
      <Box className={classes.root}>
         <RegistrationModal
            open={Boolean(joinGroupModalData)}
            onQuestionsAnswered={onQuestionsAnswered}
            livestream={joinGroupModalData?.livestream}
            groups={joinGroupModalData?.groups}
         />
      </Box>
   )
}

export default ViewerGroupCategorySelectMenu
