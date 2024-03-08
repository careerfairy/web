import { FC } from "react"
import { Stack } from "@mui/material"
import { sxStyles } from "@careerfairy/shared-ui"
import { Trash2 as DeleteIcon } from "react-feather"
import SteppedDialog from "components/views/stepped-dialog/SteppedDialog"

const styles = sxStyles({
   wrapContainer: {
      height: {
         xs: "320px",
         md: "100%",
      },
   },
   reducePadding: {
      px: { xs: 3, md: "28px !important" },
      height: {
         xs: "500px",
         md: "100%",
      },
   },
   container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      height: "100%",
      width: "100%",
      px: 2,
   },
   content: {
      my: 1,
   },
   info: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
   },
   title: {
      fontSize: { xs: "18px", md: "20px" },
   },
   subtitle: {
      maxWidth: "unset",
      fontSize: { xs: "16px", md: "16px" },
   },
   actions: {
      position: "absolute !important",
      width: "100%",
      display: "flex",
      justifyContent: {
         xs: "center",
         md: "space-evenly",
      },
      borderTop: "none !important",
      backgroundColor: "#FFFFFF !important",
   },
   cancelBtn: {
      color: "grey",
   },
   actionBtn: {
      width: "160px",
      height: "40px",
      boxShadow: "none",
   },
})

type RemoveQuestionProps = {
   handleCancelClick: () => void
}

const RemoveQuestion: FC<RemoveQuestionProps> = ({ handleCancelClick }) => {
   return (
      <SteppedDialog.Container
         containerSx={styles.content}
         sx={styles.wrapContainer}
         hideCloseButton
         withActions
      >
         <SteppedDialog.Content sx={styles.container}>
            <Stack spacing={3} sx={styles.info}>
               <DeleteIcon color={"#FF4545"} size={48} />

               <SteppedDialog.Title sx={styles.title}>
                  Remove question?
               </SteppedDialog.Title>

               <SteppedDialog.Subtitle sx={styles.subtitle}>
                  Are you sure you want to remove this question? All data
                  inserted will be lost.
               </SteppedDialog.Subtitle>
            </Stack>
         </SteppedDialog.Content>
         <SteppedDialog.Actions sx={styles.actions}>
            <SteppedDialog.Button
               variant="outlined"
               color="grey"
               onClick={handleCancelClick}
               sx={[styles.cancelBtn, styles.actionBtn]}
            >
               Cancel
            </SteppedDialog.Button>

            <SteppedDialog.Button
               variant="contained"
               color={"error"}
               disabled={false}
               type="submit"
               onClick={undefined}
               loading={false}
               sx={styles.actionBtn}
            >
               {"Yes, I'm sure"}
            </SteppedDialog.Button>
         </SteppedDialog.Actions>
      </SteppedDialog.Container>
   )
}

export default RemoveQuestion
