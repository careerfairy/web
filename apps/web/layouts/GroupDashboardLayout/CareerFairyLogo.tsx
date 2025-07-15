import { Box, BoxProps, styled } from "@mui/material"
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
   padding: theme.spacing(0.5, 1),
}))

export const CareerFairyLogo = (props: BoxProps) => {
   return (
      <Root {...props}>
         <MainLogo sx={styles.logo} />
      </Root>
   )
}
