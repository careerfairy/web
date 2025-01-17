import { Box, Stack, Typography } from "@mui/material"
import { cvTemplate } from "constants/files"
import { cvBackground } from "constants/images"
import { CVBlockType } from "data/hygraph/types"
import Image from "next/image"
import { ArrowRight } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: (theme) => ({
      display: "flex",
      height: "200px",
      padding: "8px",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "flex-start",
      alignSelf: "stretch",
      borderRadius: "12px",
      border: `1px solid ${theme.palette.neutral[50]}`,
      background: theme.brand.white[500],
   }),
   wrapper: {
      position: "relative",
      width: "100%",
      height: "100%",
   },
   image: {
      flex: "1 0 0",
      alignSelf: "stretch",
      borderRadius: "8px",
      objectFit: "cover",
   },
   overlay: {
      position: "relative",
      mt: 1,
      ml: 1,
   },
   templateTitle: {
      color: "white",
      fontSize: "32px",
      fontWeight: 900,
      lineHeight: "31px",
      width: "min-content",
   },
   templateSubTitle: {
      color: (theme) => theme.brand.white[200],
      fontSize: "16px",
      fontWeight: 400,
      lineHeight: "24px",
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
   },
})

type Props = CVBlockType

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const CVBlock = (props: Props) => {
   return (
      <Box sx={styles.root} href={cvTemplate} component="a">
         <Box sx={styles.wrapper}>
            <Image
               style={styles.image}
               src={cvBackground}
               alt="CV image background"
               fill
               priority
            />
            <Stack spacing={1.5} sx={styles.overlay}>
               <Typography sx={styles.templateTitle}>CV Template</Typography>
               <Typography sx={styles.templateSubTitle}>
                  Check&apos;s aus
                  <ArrowRight size={12} />
               </Typography>
            </Stack>
         </Box>
      </Box>
   )
}
