import CloseIcon from "@mui/icons-material/Close"
import { Box } from "@mui/material"
import Card from "@mui/material/Card"
import IconButton from "@mui/material/IconButton"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { SnackbarContent, useSnackbar, VariantType } from "notistack"
import { forwardRef, ReactNode, useCallback } from "react"
import { sxStyles } from "../../../types/commonTypes"

const styles = sxStyles({
   root: {
      "@media (min-width:600px)": {
         minWidth: "344px !important",
      },
      maxWidth: 460,
   },
   card: {
      width: "100%",
      p: 2,
   },
   actionRoot: {
      padding: [1, 1, 1, 2],
      justifyContent: "space-between",
   },
   icons: {
      position: "absolute",
      right: 0,
      top: 0,
      p: 2,
   },
   expand: {
      p: 1,
      m: -1,
   },
})

interface ReportCompleteProps {
   content: string | ReactNode
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
               <Stack spacing={1.25}>
                  {props.title ? (
                     <Typography
                        fontWeight={700}
                        variant="brandedH5"
                        component="h5"
                        color={getColor(variant)}
                     >
                        {props.title}
                     </Typography>
                  ) : null}
                  {Boolean(props.content) && (
                     <Typography variant="small">{props.content}</Typography>
                  )}
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
            </Card>
         </Box>
      )
   }
)

const getColor = (variant: VariantType) => {
   switch (variant) {
      case "success":
         return "primary.main"
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
