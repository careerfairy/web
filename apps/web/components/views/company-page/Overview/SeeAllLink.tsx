import { Stack, Typography, useTheme } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ArrowRight } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      cursor: "pointer",
   },
   seeAllLink: {
      textDecoration: "underline",
      fontWeight: 400,
   },
   mobileSeeAllLink: {
      fontWeight: 400,
   },
})
type Props = {
   handleClick?: () => void
}

export const SeeAllLink = ({ handleClick }: Props) => {
   const isMobile = useIsMobile()
   const theme = useTheme()

   return (
      <Stack
         direction="row"
         alignItems="center"
         spacing={"6px"}
         onClick={() => handleClick?.()}
         sx={styles.root}
      >
         <Typography
            variant="small"
            color="neutral.600"
            sx={isMobile ? styles.mobileSeeAllLink : styles.seeAllLink}
         >
            See all
         </Typography>
         {isMobile ? (
            <ArrowRight size={14} color={theme.brand.black[700]} />
         ) : null}
      </Stack>
   )
}
