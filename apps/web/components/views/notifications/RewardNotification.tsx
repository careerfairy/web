import { forwardRef, ReactNode, useCallback, useEffect } from "react"
import { SnackbarContent, useSnackbar } from "notistack"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import { sxStyles } from "../../../types/commonTypes"
import { Box } from "@mui/material"
import Stack from "@mui/material/Stack"
import { responsiveConfetti } from "../../util/confetti"
import useIsMobile from "../../custom-hook/useIsMobile"

const styles = sxStyles({
   root: {
      "@media (min-width:600px)": {
         minWidth: "344px !important",
      },
      maxWidth: 450,
   },
   card: {
      width: "100%",
      p: 1,
   },
   actionRoot: {
      padding: [1, 1, 1, 2],
      justifyContent: "space-between",
   },
   icons: {
      marginLeft: "auto",
      alignSelf: "flex-start",
   },
   expand: {
      padding: [1, 1],
   },
})

interface ReportCompleteProps {
   message: string | ReactNode
   id: string | number
}

const RewardNotification = forwardRef<HTMLDivElement, ReportCompleteProps>(
   ({ id, ...props }, ref) => {
      const isMobile = useIsMobile()
      const { closeSnackbar } = useSnackbar()

      useEffect(() => {
         responsiveConfetti(isMobile)
         // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])

      const handleDismiss = useCallback(() => {
         closeSnackbar(id)
      }, [id, closeSnackbar])

      return (
         <Box component={SnackbarContent} ref={ref} sx={styles.root}>
            <Card sx={styles.card}>
               <CardActions sx={styles.actionRoot}>
                  <Stack spacing={1.5}>
                     <Typography
                        fontSize="1.42rem"
                        fontWeight={700}
                        variant="h4"
                        color="primary.main"
                     >
                        Congratulations!
                     </Typography>
                     <Typography variant="body1">{props.message}</Typography>
                  </Stack>
                  <Box sx={styles.icons}>
                     <IconButton
                        size="small"
                        sx={styles.expand}
                        onClick={handleDismiss}
                     >
                        <CloseIcon fontSize="small" />
                     </IconButton>
                  </Box>
               </CardActions>
            </Card>
         </Box>
      )
   }
)

RewardNotification.displayName = "RewardNotification"

export default RewardNotification
