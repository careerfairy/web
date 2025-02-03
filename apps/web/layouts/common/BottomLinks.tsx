// material-ui
import { Box, Divider } from "@mui/material"
import Stack from "@mui/material/Stack"

// react feather
import { HelpCircle } from "react-feather"

// project imports
import { MainLogo, MiniLogoGreenBg } from "../../components/logos"
import { supportPageLink } from "../../constants/links"
import { sxStyles } from "../../types/commonTypes"
import { useGroup } from "../GroupDashboardLayout"
import { NavLink } from "./NavList"

const styles = sxStyles({
   logo: {
      maxWidth: "80%",
   },
})

type Props = {
   hideMainLogo?: boolean
}

const BottomLinks = ({ hideMainLogo }: Props) => {
   const { shrunkLeftMenuIsActive } = useGroup()

   return (
      <Stack
         spacing={2}
         mb={3}
         mx={2}
         justifyContent="center"
         width={"100%"}
         divider={
            <Box px={5}>
               <Divider />
            </Box>
         }
      >
         {hideMainLogo ? (
            <></>
         ) : (
            <Box px={5}>
               {shrunkLeftMenuIsActive ? (
                  <MiniLogoGreenBg />
               ) : (
                  <MainLogo sx={styles.logo} />
               )}
            </Box>
         )}

         <Box mx={"16px !important"}>
            <NavLink
               href={supportPageLink}
               id={"support-page"}
               baseTextColor={"text.primary"}
               title={shrunkLeftMenuIsActive ? "" : "Support"}
               Icon={HelpCircle}
               external
            />
         </Box>
      </Stack>
   )
}

export default BottomLinks
