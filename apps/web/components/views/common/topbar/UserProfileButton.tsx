import { Box, IconButton, Tooltip } from "@mui/material"
import BadgeIcon from "../BadgeIcon"
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined"
import React from "react"
import makeStyles from "@mui/styles/makeStyles"
import useGeneralHeader from "components/custom-hook/useGeneralHeader"
import Link from "../../../../materialUI/NextNavLink"
import { getUserBadges } from "@careerfairy/shared-lib/dist/badges"

const useStyles = makeStyles((theme) => ({
   navIconButton: {
      "&.MuiLink-underlineHover": {
         textDecoration: "none !important",
      },
   },
}))

const UserProfileButton = ({ userBadges = [], white = false }) => {
   const currentBadge = getUserBadges(userBadges)?.networkerBadge()
   const { headerColors } = useGeneralHeader()

   const classes = useStyles({
      navLinksActiveColor: headerColors.navLinksActiveColor,
   })

   return (
      <IconButton
         id="profile_icon"
         component={Link as any}
         className={classes.navIconButton}
         color="primary"
         href="/profile"
         size="large"
         sx={white ? { color: "white" } : {}}
      >
         {currentBadge && (
            <Tooltip title={`${currentBadge.name} Badge`}>
               <Box
                  sx={{
                     position: "absolute",
                     top: 0,
                     left: "4px",
                  }}
               >
                  <BadgeIcon
                     badgeKey={currentBadge.key}
                     noBg={true}
                     width={15}
                     height={15}
                  />
               </Box>
            </Tooltip>
         )}

         <AccountCircleOutlinedIcon />
      </IconButton>
   )
}

export default UserProfileButton
