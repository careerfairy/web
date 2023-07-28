import LinkedInIcon from "@mui/icons-material/LinkedIn"
import EditIcon from "@mui/icons-material/ModeEditOutlineOutlined"
import {
   Box,
   Chip,
   CircularProgress,
   Divider,
   Stack,
   Typography,
} from "@mui/material"
import CreatorFetchWrapper from "HOCs/creator/CreatorFetchWrapper"
import CreatorAvatar from "components/views/sparks/components/CreatorAvatar"
import { useGroup } from "layouts/GroupDashboardLayout"
import { FC, useCallback } from "react"
import { useSelector } from "react-redux"
import { sparksSelectedCreatorId } from "store/selectors/adminSparksSelectors"
import { sxStyles } from "types/commonTypes"
import SparksDialog, { useSparksForm } from "../SparksDialog"
import {
   Creator,
   pickPublicDataFromCreator,
} from "@careerfairy/shared-lib/groups/creators"

const styles = sxStyles({
   creatorDetailsWrapper: {
      display: "flex",
      maxHeight: 488,
      backgroundColor: "#FEFEFE",
      position: "relative",
      width: {
         xs: "100%",
         md: 494,
      },
      borderRadius: 2,
      border: "1px solid #F8F8F8",
      p: 3.5,
      flexDirection: "column",
      alignItems: "center",
      overflow: "auto",
      my: "auto",
   },
   editButton: {
      top: 0,
      right: 0,
      position: "absolute",
      padding: 3.5,
      "& .MuiChip-label": {
         color: "#A0A0A0",
         fontSize: "1.14286rem",
      },
      color: "#A0A0A0",
   },
   avatar: {
      width: 136,
      height: 136,
   },
   fullName: {
      fontSize: "1.71429rem",
      fontWeight: 600,
      lineHeight: "1.42857rem",
   },
   details: {
      fontSize: "1.14286rem",
      fontWeight: 400,
      lineHeight: "1.42857rem",
   },
   linkedIn: {
      color: "#0066C8",
      flexWrap: "nowrap",
      display: "flex",
      alignItems: "center",
      "& p": {
         color: "inherit",
         ml: 1,
      },
   },
   story: {
      fontSize: "1.14286rem",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "normal",
      letterSpacing: "0.00821rem",
      textAlign: "center",
      whiteSpace: "pre-wrap",
   },
})

const CreatorSelectedView = () => {
   const {
      goToCreateSparkView,
      goToSelectCreatorView,
      goToCreateOrEditCreatorView,
   } = useSparksForm()
   const { group } = useGroup()

   const selectedCreatorId = useSelector(sparksSelectedCreatorId)

   const handleClickEdit = useCallback(
      (creator: Creator) => {
         goToCreateOrEditCreatorView(pickPublicDataFromCreator(creator))
      },
      [goToCreateOrEditCreatorView]
   )

   const handleBack = useCallback(() => {
      goToSelectCreatorView()
   }, [goToSelectCreatorView])

   const handleNext = useCallback(() => {
      goToCreateSparkView()
   }, [goToCreateSparkView])

   return (
      <CreatorFetchWrapper
         selectedCreatorId={selectedCreatorId}
         groupId={group.id}
         shouldFetch={Boolean(selectedCreatorId)}
      >
         {(creator) =>
            creator ? (
               <SparksDialog.Container onMobileBack={handleBack}>
                  <SparksDialog.Content>
                     <SparksDialog.Title>
                        <Box component="span" color="secondary.main">
                           Creator
                        </Box>{" "}
                        selected!
                     </SparksDialog.Title>
                     <SparksDialog.Subtitle>
                        Please check if that’s the correct creator
                     </SparksDialog.Subtitle>
                     <Box sx={styles.creatorDetailsWrapper}>
                        <Box sx={styles.editButton}>
                           <Chip
                              label="Edit"
                              onDelete={() => handleClickEdit(creator)}
                              onClick={() => handleClickEdit(creator)}
                              deleteIcon={<EditIcon />}
                           />
                        </Box>
                        <CreatorAvatar creator={creator} sx={styles.avatar} />
                        <Box mt={2.85} />
                        <Typography sx={styles.fullName} component="h4">
                           {creator.firstName} {creator.lastName}
                        </Typography>
                        <Box mt={2} />
                        <Stack
                           direction="row"
                           divider={<Divider orientation="vertical" flexItem />}
                           spacing={1.5}
                        >
                           <Details>{creator.position}</Details>
                           {creator.linkedInUrl ? (
                              <Box
                                 component="a"
                                 target="_blank"
                                 href={creator.linkedInUrl}
                                 sx={styles.linkedIn}
                              >
                                 <LinkedInIcon />
                                 <Typography>Linked</Typography>
                              </Box>
                           ) : null}
                        </Stack>
                        <Box mt={2} />
                        <Details>{creator.email}</Details>
                        <Box mt={2} />
                        <Typography sx={styles.story}>
                           {creator.story || "No story"}
                        </Typography>
                     </Box>
                     <SparksDialog.ActionsOffset />
                  </SparksDialog.Content>
                  <SparksDialog.Actions>
                     <SparksDialog.Button
                        color="grey"
                        variant="outlined"
                        onClick={handleBack}
                     >
                        Back
                     </SparksDialog.Button>
                     <SparksDialog.Button
                        variant="contained"
                        onClick={handleNext}
                     >
                        Next
                     </SparksDialog.Button>
                  </SparksDialog.Actions>
               </SparksDialog.Container>
            ) : (
               <CircularProgress /> // TODO: Add loading skeleton UI
            )
         }
      </CreatorFetchWrapper>
   )
}

const Details: FC = ({ children }) => (
   <Typography variant="body2" color="text.secondary" sx={styles.details}>
      {children}
   </Typography>
)

export default CreatorSelectedView
