import { Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ResponsiveDialogLayout } from "components/views/common/ResponsiveDialog"
import { ReactNode } from "react"
import { sxStyles } from "types/commonTypes"

export const styles = sxStyles({
   dialog: {
      maxWidth: 1100,
   },
   header: {
      px: { xs: 1.5, md: 4 },
      pt: { xs: 1.5, md: 4 },
      position: "relative",
      "& .close-button": {
         position: "absolute",
         top: {
            xs: 12,
            md: 16,
         },
         right: {
            xs: 12,
            md: 16,
         },
      },
   },
   content: {
      display: "flex",
      flexDirection: "column",
      px: { xs: 1.5, md: 4 },
   },
})

type HeaderProps = {
   title?: string
   start?: string
   onClose: () => void
}

/**
 * Same header ui will be used for all feedback dialogs
 */
export const Header = ({ title, start, onClose }: HeaderProps) => {
   const isMobile = useIsMobile()

   return (
      <ResponsiveDialogLayout.Header sx={styles.header} handleClose={onClose}>
         <Stack spacing={0.5}>
            <Typography variant="small" color="neutral.400">
               {start}
            </Typography>
            <Typography
               color="neutral.800"
               variant={isMobile ? "brandedH4" : "brandedH3"}
               fontWeight={isMobile ? "700" : "600"}
            >
               {title}
            </Typography>
         </Stack>
      </ResponsiveDialogLayout.Header>
   )
}

type ContentProps = {
   children: ReactNode
}

/**
 * Same content ui will be used for all feedback dialogs
 */
export const Content = ({ children }: ContentProps) => {
   return (
      <ResponsiveDialogLayout.Content sx={styles.content}>
         {children}
      </ResponsiveDialogLayout.Content>
   )
}
