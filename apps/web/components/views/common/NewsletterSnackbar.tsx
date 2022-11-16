import {
   Button,
   Grid,
   Slide,
   Snackbar,
   SnackbarContent,
   Typography,
} from "@mui/material"
import { useState } from "react"
import CloseIcon from "@mui/icons-material/Close"
import IconButton from "@mui/material/IconButton"
import useIsMobile from "../../custom-hook/useIsMobile"
import { sxStyles } from "../../../types/commonTypes"

const styles = sxStyles({
   closeBtnWrapper: {
      display: "flex",
      justifyContent: "end",
      mb: 1,
   },
   message: {
      color: "black",
      fontWeight: 400,
   },
   subMessage: {
      color: "black",
      mt: 2,
      fontWeight: 500,
   },
   buttonsWrapper: {
      mt: 3,
      display: "flex",
      alignItems: "center",
   },
   noButton: {
      cursor: "pointer",
      color: "black",
      fontWeight: 400,
      width: "fit-content",
   },
})

type Props = {}

const TransitionDown = (props) => <Slide {...props} direction="up" />

const NewsletterSnackbar = ({}: Props): JSX.Element => {
   const [open, setOpen] = useState(true)
   const [isFirst, setIsFirst] = useState(true)
   const isMobile = useIsMobile()

   return (
      <Snackbar
         anchorOrigin={{
            vertical: "bottom",
            horizontal: isMobile ? "center" : "right",
         }}
         open={open}
         TransitionComponent={TransitionDown}
         key={"newsletter"}
         sx={isMobile && { left: 26, right: 26, bottom: 36 }}
      >
         <SnackbarContent
            sx={{ backgroundColor: "white" }}
            message={
               <Grid container maxWidth={isMobile ? "inherit" : "350px"}>
                  <Grid xs={12} item sx={styles.closeBtnWrapper}>
                     <IconButton
                        aria-label="close"
                        color="default"
                        onClick={() => setOpen(false)}
                        size="small"
                     >
                        <CloseIcon />
                     </IconButton>
                  </Grid>
                  <Grid xs={11} item>
                     <Grid xs={12} item>
                        {isFirst ? (
                           <Typography variant="h6" sx={styles.message}>
                              Sure you want to miss our <b>relevant tips</b> for
                              your career?
                           </Typography>
                        ) : (
                           <Typography variant="h6" sx={styles.message}>
                              Oh 😣 <br /> <br />
                              You just missed an event you may have liked. This
                              is the last chance you have to stay up-to-date.
                           </Typography>
                        )}

                        <Typography variant="h6" sx={styles.subMessage}>
                           {isMobile
                              ? "Subscribe to our tips"
                              : "Subscribe to our newsletter"}
                        </Typography>
                     </Grid>
                     <Grid xs={12} item sx={styles.buttonsWrapper}>
                        <Grid
                           xs={8}
                           display="flex"
                           justifyContent={isFirst ? "start" : "end"}
                        >
                           <Typography
                              sx={styles.noButton}
                              variant="h6"
                              onClick={() => {}}
                           >
                              {isFirst ? "Remind me later" : "No"}
                           </Typography>
                        </Grid>
                        <Grid xs={4} display="flex" justifyContent="end">
                           <Button
                              onClick={() => setIsFirst(!isFirst)}
                              variant="contained"
                              color="secondary"
                              size="large"
                              sx={{ py: 1 }}
                           >
                              Yes
                           </Button>
                        </Grid>
                     </Grid>
                  </Grid>
               </Grid>
            }
         />
      </Snackbar>
   )
}

export default NewsletterSnackbar
