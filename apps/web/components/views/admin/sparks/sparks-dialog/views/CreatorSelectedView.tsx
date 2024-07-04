import {
   Creator,
   pickPublicDataFromCreator,
} from "@careerfairy/shared-lib/groups/creators"
import EditIcon from "@mui/icons-material/ModeEditOutlineOutlined"
import { Box, Chip } from "@mui/material"
import CreatorFetchWrapper from "HOCs/creator/CreatorFetchWrapper"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { CreatorPreview } from "components/views/creator/CreatorPreview"
import { useGroup } from "layouts/GroupDashboardLayout"
import { FC, useCallback } from "react"
import { useSelector } from "react-redux"
import { sparksSelectedCreatorId } from "store/selectors/adminSparksSelectors"
import { sxStyles } from "types/commonTypes"
import SparksDialog, { useSparksForm } from "../SparksDialog"

const styles = sxStyles({
   creatorDetailsWrapper: {
      maxHeight: 488,
      backgroundColor: "#FEFEFE",
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
            <CreatorPreview sx={styles.creatorDetailsWrapper} creator={creator}>
               <Box sx={styles.editButton}>
                  <Chip
                     label="Edit"
                     onDelete={() => handleClickEdit(creator)}
                     onClick={() => handleClickEdit(creator)}
                     deleteIcon={<EditIcon />}
                  />
               </Box>
            </CreatorPreview>
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

export default CreatorSelectedView
