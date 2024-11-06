import { StudyBackground } from "@careerfairy/shared-lib/users"
import { Box, Button, Stack, Typography } from "@mui/material"
import { SchoolIcon } from "components/views/common/icons/SchoolIcon"
import { Fragment, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { BaseProfileDialog } from "./dialogs/BaseProfileDialog"
import { StudyBackgroundFormProvider } from "./forms/StudyBackgroundForm"

const styles = sxStyles({
   title: {
      fontWeight: 600,
      color: (theme) => theme.palette.neutral[900],
   },
   studiesRoot: {
      p: "16px 12px",
      backgroundColor: (theme) => theme.brand.white[300],
      border: (theme) => `1px solid ${theme.brand.white[400]}`,
      borderRadius: "8px",
   },
   emptyDetailsRoot: {
      alignItems: "center",
      width: {
         xs: "280px",
         sm: "280px",
         md: "390px",
      },
   },
   emptyTitle: {
      fontWeight: 600,
      textAlign: "center",
   },
   emptyDescription: {
      fontWeight: 400,
      textAlign: "center",
   },
   addButton: {
      p: "8px 16px",
   },
   schoolIcon: {
      width: "36px",
      height: "36px",
   },
})
export const ProfileStudyBackground = () => {
   return (
      <StudyBackgroundFormProvider>
         <Stack spacing={1.5}>
            <Typography variant="brandedBody" sx={styles.title}>
               Study background
            </Typography>
            <StudyBackgroundDetails />
         </Stack>
      </StudyBackgroundFormProvider>
   )
}

// type StudyBackgroundDetailsProps = {
//    studyBackgroundToEdit?: StudyBackground
// }

const StudyBackgroundDetails = () => {
   const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)

   const handleClose = () => setIsDialogOpen(false)

   const handleSave = () => setIsDialogOpen(false)

   return (
      <Fragment>
         <Box
            sx={styles.studiesRoot}
            display={"flex"}
            flexDirection="column"
            alignItems={"center"}
            justifyContent={"center"}
         >
            <StudyBackgroundsListView
               handleAddBackground={() => setIsDialogOpen(true)}
            />
         </Box>
         <BaseProfileDialog
            open={isDialogOpen}
            handleClose={handleClose}
            handleSave={handleSave}
         >
            <Box>yode</Box>
         </BaseProfileDialog>
      </Fragment>
   )
}

type StudyBackgroundsListViewProps = {
   studyBackgrounds?: StudyBackground[]
   handleEdit?: (studyBackground: StudyBackground) => void
   handleDelete?: (studyBackground: StudyBackground) => void
   handleAddBackground?: () => void
}

const StudyBackgroundsListView = (props: StudyBackgroundsListViewProps) => {
   const { studyBackgrounds = [], handleAddBackground } = props

   if (!studyBackgrounds.length)
      return (
         <EmptyStudyBackgroundView
            handleAddBackground={() =>
               handleAddBackground && handleAddBackground()
            }
         />
      )

   return <Box>{`${studyBackgrounds.length} all study backgrounds`}</Box>
}

type EmptyStudyBackgroundViewProps = {
   handleAddBackground: () => void
}

const EmptyStudyBackgroundView = ({
   handleAddBackground,
}: EmptyStudyBackgroundViewProps) => {
   return (
      <Stack alignItems={"center"} spacing={2}>
         <Box color={"primary.main"}>
            <SchoolIcon sx={styles.schoolIcon} />
         </Box>
         <Stack spacing={2} sx={styles.emptyDetailsRoot}>
            <Stack alignItems={"center"}>
               <Typography
                  sx={styles.emptyTitle}
                  color="neutral.800"
                  variant="brandedBody"
               >
                  What did you study?
               </Typography>
               <Typography
                  sx={styles.emptyDescription}
                  color={"neutral.700"}
                  variant="small"
               >
                  Share your formal education background with us, including the
                  school, program, and field of study.
               </Typography>
            </Stack>
            <Button
               variant="contained"
               color="primary"
               sx={styles.addButton}
               onClick={handleAddBackground}
            >
               Add study background
            </Button>
         </Stack>
      </Stack>
   )
}
