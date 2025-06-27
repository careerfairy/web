// material-ui
import { Box, Divider } from "@mui/material"
import Stack from "@mui/material/Stack"

// react feather
import { HelpCircle } from "react-feather"

// project imports
import { Fragment } from "react"
import { supportPageLink } from "../../constants/links"
import { NavLink } from "./NavList"

const BottomLinks = () => {
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
         {/* Triggers the divider */}
         <Fragment />

         <Box mx={"16px !important"}>
            <NavLink
               href={supportPageLink}
               id={"support-page"}
               baseTextColor={"text.primary"}
               title={"Support"}
               Icon={HelpCircle}
               external
            />
         </Box>
      </Stack>
   )
}

export default BottomLinks
