import React from "react"

// material-ui
import Stack from "@mui/material/Stack"
import { Box, Divider } from "@mui/material"

// react feather
import { HelpCircle } from "react-feather"

// project imports
import { NavLink } from "./NavList"
import { sxStyles } from "../../types/commonTypes"
import { supportPageLink } from "../../constants/links"
import { MainLogo } from "../../components/logos"

const styles = sxStyles({
   logo: {
      maxWidth: "80%",
   },
})

type Props = {
   hideMainLogo?: boolean
}

const BottomLinks = ({ hideMainLogo }: Props) => {
   return (
      <Stack
         spacing={2}
         mb={3}
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
               <MainLogo sx={styles.logo} />
            </Box>
         )}

         <NavLink
            href={supportPageLink}
            id={"support-page"}
            baseTextColor={"text.primary"}
            title={"Support"}
            Icon={HelpCircle}
            external
         />
      </Stack>
   )
}

export default BottomLinks
