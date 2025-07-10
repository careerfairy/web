import { Box, styled } from "@mui/material"
import { MainLogo } from "components/logos"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   logo: {
      width: 99,
      height: 24,
      mt: "auto",
   },
})

const Root = styled(Box)(({ theme }) => ({
   my: "auto",
   display: "flex",
   width: "100%",
   marginTop: 20,
   padding: theme.spacing(0.5, 3),
}))

export const CareerFairyLogo = () => {
   return (
      <Root>
         <MainLogo sx={styles.logo} />
      </Root>
   )
}
