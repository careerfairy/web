import { Box, Button, Stack, SxProps, Theme, Typography } from "@mui/material"

import { ResponsiveDialogLayout } from "components/views/common/ResponsiveDialog"
import { EmptyPlaceholder } from "components/views/common/icons/EmptyPlaceholder"
import { combineStyles, sxStyles } from "types/commonTypes"

const styles = sxStyles({
   notFoundRoot: {
      width: "100%",
      p: 2,
      background: (theme) => theme.brand.white[50],
      borderRadius: "8px",
      border: (theme) => `1px solid ${theme.palette.neutral[50]}`,
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "center",
   },
   notFoundWrapper: {
      width: "100%",
      borderRadius: "12px",
      border: (theme) => `1px solid ${theme.brand.white[500]}`,
      background: (theme) => theme.brand.white[100],
      height: "400px",
      p: "24px",
      alignItems: "center",
      justifyContent: "center",
   },
   emptyPlaceholder: {
      "& svg": {
         width: "195px",
         height: "128px",
      },
   },
   mobileNotFoundWrapper: {
      px: "12px",
      height: "85dvh",
   },
})

type NotFoundWrapperProps = {
   isOpen: boolean
   handleNotFoundClose: () => void
}

export const CustomJobNotFoundDialog = ({
   isOpen,
   handleNotFoundClose,
}: NotFoundWrapperProps) => {
   return (
      <ResponsiveDialogLayout open={isOpen} handleClose={handleNotFoundClose}>
         <ResponsiveDialogLayout.Content>
            <Box sx={styles.mobileNotFoundWrapper}>
               <CustomJobNotFoundView />
            </Box>
         </ResponsiveDialogLayout.Content>
         <ResponsiveDialogLayout.Actions>
            <Button fullWidth variant="contained" onClick={handleNotFoundClose}>
               Back to jobs
            </Button>
         </ResponsiveDialogLayout.Actions>
      </ResponsiveDialogLayout>
   )
}

type CustomJobNotFoundViewProps = {
   rootSx?: SxProps<Theme>
}

export const CustomJobNotFoundView = ({
   rootSx,
}: CustomJobNotFoundViewProps) => {
   return (
      <Stack
         spacing={"12px"}
         sx={combineStyles(styles.notFoundWrapper, rootSx)}
      >
         <Box sx={styles.emptyPlaceholder}>
            <EmptyPlaceholder />
         </Box>
         <Stack spacing={"4px"}>
            <Typography variant="medium" color={"neutral.800"} fontWeight={600}>
               Oops... This job is no longer available
            </Typography>
            <Typography variant="small" color={"neutral.700"} fontWeight={400}>
               But don&apos;t worry, there are plenty of others to explore.
            </Typography>
         </Stack>
      </Stack>
   )
}
