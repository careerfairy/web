import React from "react"
import { Avatar, Box } from "@mui/material"
import { sxStyles } from "../../../types/commonTypes"
import NavList from "../../common/NavList"
import Link from "../../../components/views/common/Link"
import { useGroup } from "../index"
import useDashboardLinks from "../../../components/custom-hook/useDashboardLinks"
import BottomLinks from "../../common/BottomLinks"

const styles = sxStyles({
   root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      flex: 1,
   },
   avatar: {
      padding: 1,
      cursor: "pointer",
      background: "white",
      width: "80%",
      height: 180,
      "& img": {
         objectFit: "contain",
      },
   },
   list: {
      width: "100%",
   },
   name: {
      marginTop: 1,
      whiteSpace: "pre-line",
   },
   description: {
      whiteSpace: "pre-line",
   },
})

const NavBar = () => {
   const { group } = useGroup()

   const mainLinks = useDashboardLinks(group)

   if (!group) {
      // TODO: add loading UI
      return null
   }

   return (
      <Box sx={styles.root}>
         <Avatar
            component={Link}
            href={`/group/${group.id}/admin/edit`}
            sx={styles.avatar}
            src={group.logoUrl}
            variant="rounded"
         />
         <NavList links={mainLinks} />
         <Box flexGrow={1} />
         <BottomLinks />
      </Box>
   )
}

export default NavBar
