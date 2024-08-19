import { Box, Skeleton, Stack, Typography } from "@mui/material"
import { sxStyles } from "types/commonTypes"

export const styles = sxStyles({
   root: (theme) => ({
      border: `1px solid ${theme.brand.white[500]}`,
      backgroundColor: theme.brand.white[100],
      borderRadius: "11px",
      transition: theme.transitions.create("border"),
      overflow: "hidden",
      position: "relative",
      padding: "16px",
      gap: "24px",
      alignSelf: "stretch",
   }),
   title: {
      fontWeight: 600,
   },
   message: {
      gap: "4px",
      alignSelf: "stretch",
      wordBreak: "break-word",
      whiteSpace: "pre-line",
   },
   buttonInfo: {
      alignItems: "flex-start",
      gap: "12px",
   },
   buttonInfoContent: {
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      alignSelf: "stretch",
   },
   buttonText: {
      alignItems: "flex-start",
      gap: "4px",
      flex: "1 0 0",
   },
   text: {
      width: "100%",
   },
})

export const CTACardSkeleton = () => {
   return (
      <Stack sx={styles.root}>
         <Stack spacing={1.5}>
            <Stack sx={styles.message}>
               <Typography
                  sx={styles.title}
                  variant="brandedBody"
                  color="neutral.800"
               >
                  Message
               </Typography>
               <Skeleton variant="text" />
            </Stack>
            <Stack sx={styles.buttonInfo}>
               <Box sx={styles.buttonInfoContent}>
                  <Stack sx={styles.buttonText}>
                     <Typography
                        variant="brandedBody"
                        color="neutral.800"
                        sx={styles.title}
                     >
                        Button text
                     </Typography>
                     <Skeleton variant="text" sx={styles.text} />
                  </Stack>
                  <Stack sx={styles.buttonText}>
                     <Typography
                        variant="brandedBody"
                        color="neutral.800"
                        sx={styles.title}
                     >
                        Clicks
                     </Typography>
                     <Skeleton variant="text" sx={styles.text} />
                  </Stack>
               </Box>
               <Stack spacing={0.5} sx={styles.text}>
                  <Typography
                     variant="brandedBody"
                     color="neutral.800"
                     sx={styles.title}
                  >
                     Button link
                  </Typography>
                  <Skeleton variant="text" sx={styles.text} />
               </Stack>
            </Stack>
         </Stack>
      </Stack>
   )
}
