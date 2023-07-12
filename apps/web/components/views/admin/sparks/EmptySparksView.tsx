import { Box, Button, Stack, Typography, TypographyProps } from "@mui/material"
import { sparksGetInspiredPdf } from "constants/files"
import { FC } from "react"
import { PlayCircle as SparksIcon } from "react-feather"
import { sxStyles } from "types/commonTypes"

const sparkIconSize = 61
const sparkIconWrapperSize = 98

const styles = sxStyles({
   root: {
      m: "auto",
      textAlign: "center",
      maxWidth: 465,
   },
   icon: {
      color: "secondary.main",
      borderRadius: "50%",
      backgroundColor: "#E7E1FFB2",
      padding: "20px",
      width: sparkIconWrapperSize,
      height: sparkIconWrapperSize,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      mx: "auto",
   },
   title: {
      display: "inline-block",
      fontSize: "1.71429rem",
      position: "relative",
      fontWeight: 700,
   },
   btn: {
      textTransform: "none",
   },
})

type Props = {}

const EmptySparksView: FC<Props> = () => {
   return (
      <Box sx={styles.root}>
         <SparkIllustration />
         <TitleText mt={2.5} maxWidth={380}>
            Your company hasn’t created any{" "}
            <TitleText color="secondary.main">Sparks</TitleText> yet.
         </TitleText>
         <Typography mt={1.5} fontSize="1.14286rem" fontWeight={400}>
            Getting ready to start with the right content? We collected
            talent&apos;s most requested questions to inspire you
         </Typography>
         <Stack spacing={1.5} mt={3} justifyContent="center" direction="row">
            <Button
               sx={styles.btn}
               color="secondary"
               variant="outlined"
               component="a"
               download
               href={sparksGetInspiredPdf}
               target="_blank"
            >
               Get inspired
            </Button>
            <Button sx={styles.btn} color="secondary" variant="contained">
               Upload a spark
            </Button>
         </Stack>
      </Box>
   )
}

const SparkIllustration = () => {
   return (
      <Box sx={styles.icon}>
         <SparksIcon width={sparkIconSize} height={sparkIconSize} />
      </Box>
   )
}

export const TitleText: FC<TypographyProps<"h1">> = (props) => {
   return <Typography sx={styles.title} component="h1" {...props} />
}

export default EmptySparksView
