import LinkedInIcon from "@mui/icons-material/LinkedIn"
import EditIcon from "@mui/icons-material/ModeEditOutlineOutlined"
import { Box, Chip, Divider, Skeleton, Stack, Typography } from "@mui/material"
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
import { SuspenseWithBoundary } from "components/ErrorBoundary"

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
      <SuspenseWithBoundary
         fallback={
            <CreatorView
               handleClickEdit={handleClickEdit}
               handleBack={handleBack}
               handleNext={handleNext}
            />
         }
      >
         <CreatorFetchWrapper
            selectedCreatorId={selectedCreatorId}
            groupId={group.id}
            shouldFetch={Boolean(selectedCreatorId)}
            fallbackComponent={() => (
               <CreatorView
                  handleClickEdit={handleClickEdit}
                  handleBack={handleBack}
                  handleNext={handleNext}
               />
            )}
         >
            {(creator) => (
               <CreatorView
                  creator={creator}
                  handleClickEdit={handleClickEdit}
                  handleBack={handleBack}
                  handleNext={handleNext}
               />
            )}
         </CreatorFetchWrapper>
      </SuspenseWithBoundary>
   )
}

const CreatorView: FC<{
   creator?: Creator
   handleClickEdit: (creator: Creator) => void
   handleBack: () => void
   handleNext: () => void
}> = ({ creator, handleClickEdit, handleBack, handleNext }) => {
   return (
      <SparksDialog.Container>
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
               {creator ? (
                  <CreatorAvatar creator={creator} sx={styles.avatar} />
               ) : (
                  <Skeleton
                     variant="circular"
                     sx={styles.avatar}
                     animation="wave"
                  />
               )}
               <Box mt={2.85} />
               <Typography sx={styles.fullName} component="h4">
                  {creator ? (
                     `${creator.firstName} ${creator.lastName}`
                  ) : (
                     <Skeleton variant="text" animation="wave" width={180} />
                  )}
               </Typography>
               <Box mt={2} />
               <Stack
                  direction="row"
                  divider={<Divider orientation="vertical" flexItem />}
                  spacing={1.5}
               >
                  {creator ? (
                     <Details>{creator.position}</Details>
                  ) : (
                     <Skeleton variant="text" animation="wave" />
                  )}
                  {creator?.linkedInUrl ? (
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
               <Details>
                  {creator ? (
                     creator.email
                  ) : (
                     <Skeleton variant="text" animation="wave" />
                  )}
               </Details>
               <Box mt={2} />
               <Typography sx={styles.story}>
                  {creator ? (
                     creator.story
                  ) : (
                     <Skeleton variant="text" animation="wave" />
                  )}
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
            <SparksDialog.Button variant="contained" onClick={handleNext}>
               Next
            </SparksDialog.Button>
         </SparksDialog.Actions>
      </SparksDialog.Container>
   )
}

const Details: FC<{
   children: React.ReactNode
}> = ({ children }) => (
   <Typography variant="body2" color="text.secondary" sx={styles.details}>
      {children}
   </Typography>
)

export default CreatorSelectedView
