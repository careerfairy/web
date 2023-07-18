import { Box, Stack } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import SparksDialog, { useSparksForm } from "../SparksDialog"
import { Chip } from "@mui/material"
import CreatorFetchWrapper from "HOCs/creator/CreatorFetchWrapper"
import { useSelector } from "react-redux"
import useUploadCreatorAvatar from "components/custom-hook/creator/useUploadCreatorAvatar"
import { useGroup } from "layouts/GroupDashboardLayout"
import { sparksSelectedCreatorId } from "store/selectors/adminSparksSelectors"
import EditIcon from "@mui/icons-material/ModeEditOutlineOutlined"
import { useCallback } from "react"
import { Avatar } from "@mui/material"

const styles = sxStyles({
   root: {},
   cretaorDetailsWrapper: {
      display: "flex",
      height: 488,
      backgroundColor: "background.paper",
      position: "relative",
      width: 494,
      borderRadius: 2,
      border: "1px solid #F8F8F8",
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
})

const CreatorSelectedView = () => {
   const { stepper, goToCreateOrEditCreatorView } = useSparksForm()
   const { group } = useGroup()

   const selectedCreatorId = useSelector(sparksSelectedCreatorId)

   const handleClickEdit = useCallback(
      (creatorId: string) => {
         goToCreateOrEditCreatorView(creatorId)
      },
      [goToCreateOrEditCreatorView]
   )

   return (
      <CreatorFetchWrapper
         selectedCreatorId={selectedCreatorId}
         groupId={group.id}
         shouldFetch={Boolean(selectedCreatorId)}
      >
         {(creator) => (
            <SparksDialog.Container
               onMobileBack={() => stepper.goToStep("select-creator")}
               sx={styles.root}
            >
               <SparksDialog.Title pl={2}>
                  <Box component="span" color="secondary.main">
                     Creator
                  </Box>{" "}
                  selected!
               </SparksDialog.Title>
               <SparksDialog.Subtitle>
                  Please check if that’s the correct creator
               </SparksDialog.Subtitle>
               <Stack
                  spacing={1}
                  p={3.5}
                  alignItems="center"
                  sx={styles.cretaorDetailsWrapper}
               >
                  <Box sx={styles.editButton}>
                     <Chip
                        label="Edit"
                        onDelete={() => handleClickEdit(creator.id)}
                        onClick={() => handleClickEdit(creator.id)}
                        deleteIcon={<EditIcon />}
                     />
                  </Box>
                  <Avatar
                     alt={`${creator.firstName} ${creator.lastName}`}
                     src={creator.avatarUrl}
                     sx={styles.avatar}
                  >
                     {creator.firstName[0]} {creator.lastName[0]}
                  </Avatar>
               </Stack>
            </SparksDialog.Container>
         )}
      </CreatorFetchWrapper>
   )
}

export default CreatorSelectedView
