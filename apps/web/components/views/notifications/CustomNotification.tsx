import { forwardRef, ReactNode, useCallback } from "react"
import { SnackbarContent, useSnackbar, VariantType } from "notistack"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import { sxStyles } from "../../../types/commonTypes"
import { Box } from "@mui/material"
import Stack from "@mui/material/Stack"

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
   title: string | ReactNode
   id: string | number
   variant?: VariantType
}

const CustomNotification = forwardRef<HTMLDivElement, ReportCompleteProps>(
   ({ id, variant, ...props }, ref) => {
      const { closeSnackbar } = useSnackbar()

      const handleDismiss = useCallback(() => {
         closeSnackbar(id)
      }, [id, closeSnackbar])

      return (
         <Box component={SnackbarContent} ref={ref} sx={styles.root}>
            <Card sx={styles.card}>
               <CardActions sx={styles.actionRoot}>
                  <Stack spacing={1.5}>
                     {props.title ? (
                        <Typography
                           fontSize="1.42rem"
                           fontWeight={700}
                           variant="h4"
                           color={getColor(variant)}
                        >
                           {props.title}
                        </Typography>
                     ) : null}
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

const getColor = (variant: VariantType) => {
   switch (variant) {
      case "success":
         return "success.main"
      case "error":
         return "error.main"
      case "warning":
         return "warning.main"
      case "info":
         return "info.main"
      default:
         return "text.primary"
   }
}

CustomNotification.displayName = "Success"

export default CustomNotification
