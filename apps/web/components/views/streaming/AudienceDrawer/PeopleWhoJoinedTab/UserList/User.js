import PropTypes from "prop-types"
import React, { memo } from "react"
import makeStyles from "@mui/styles/makeStyles"
import withStyles from "@mui/styles/withStyles"
import {
   Avatar,
   Badge,
   IconButton,
   ListItem,
   ListItemAvatar,
   ListItemIcon,
   ListItemText,
   Menu,
   MenuItem,
   Tooltip,
   Typography,
} from "@mui/material"
import HowToRegRoundedIcon from "@mui/icons-material/HowToRegRounded"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import LinkedInIcon from "@mui/icons-material/LinkedIn"
import EmailIcon from "@mui/icons-material/Email"
import GetAppIcon from "@mui/icons-material/GetApp"
import { makeExternalLink } from "../../../../../helperFunctions/HelperFunctions"
import BadgeIcon from "../../../../common/BadgeIcon"
import { getUserBadges } from "@careerfairy/shared-lib/dist/users/UserBadges"

const useStyles = makeStyles((theme) => ({
   root: {
      borderRadius: theme.spacing(1),
   },
   highlighted: {
      "& .MuiAvatar-root": {
         backgroundColor: theme.palette.primary.dark,
         color: theme.palette.common.white,
      },
      background: theme.palette.primary.main,
      "&:hover": {
         background: theme.palette.primary.dark,
         "& .MuiAvatar-root": {
            backgroundColor: theme.palette.primary.light,
         },
      },
   },
   menu: {
      background: theme.palette.background.paper,
   },
   menuItem: {
      color: "inherit !important",
   },
   talentPoolIcon: {
      alignSelf: "center",
      marginTop: 0,
   },
}))

const SmallAvatar = withStyles((theme) => ({
   root: {
      width: 22,
      height: 22,
      border: `2px solid ${theme.palette.background.paper}`,
      background: theme.palette.background.paper,
   },
}))(Avatar)

const User = ({ user, style, inTalentPool }) => {
   const classes = useStyles()
   const {
      firstName,
      lastName,
      avatarUrl,
      university,
      userEmail,
      userResume,
      linkedinUrl,
   } = user
   const currentBadge = getUserBadges(user?.badges)?.networkerBadge()

   const [anchorEl, setAnchorEl] = React.useState(null)
   const open = Boolean(anchorEl)

   const handleClick = (event) => {
      setAnchorEl(event.currentTarget)
   }

   const handleClose = () => {
      setAnchorEl(null)
   }

   const menuItems = [
      {
         label: "Send an Email",
         onClick: () => handleClose(),
         icon: <EmailIcon fontSize="small" />,
         valid: true,
         href: `mailto:${userEmail}`,
      },
      {
         label: "View LinkedIn Profile",
         onClick: () => handleClose(),
         icon: <LinkedInIcon fontSize="small" />,
         valid: Boolean(linkedinUrl),
         href: `${makeExternalLink(linkedinUrl)}`,
      },
      {
         label: "Download CV",
         onClick: () => handleClose(),
         icon: <GetAppIcon fontSize="small" />,
         valid: Boolean(userResume),
         href: `${userResume}`,
         download: `${firstName} ${lastName} CV`,
      },
   ]

   return (
      <ListItem
         className={classes.root}
         style={style}
         button={inTalentPool}
         alignItems="flex-start"
      >
         <Tooltip
            color="primary"
            title={inTalentPool ? "Is in talent pool" : ""}
         >
            <ListItemAvatar>
               <Badge
                  anchorOrigin={{
                     vertical: "top",
                     horizontal: "left",
                  }}
                  overlap="circular"
                  badgeContent={
                     currentBadge ? (
                        <Tooltip
                           title={
                              currentBadge.name +
                              " Badge - " +
                              currentBadge.requirements[0].description
                           }
                        >
                           <SmallAvatar
                              sx={{
                                 boxShadow:
                                    "0px 2px 5px 0px rgba(91, 91, 91, 0.30)",
                              }}
                           >
                              <BadgeIcon
                                 badgeKey={currentBadge.key}
                                 noBg={true}
                                 width={15}
                                 height={15}
                              />
                           </SmallAvatar>
                        </Tooltip>
                     ) : (
                        ""
                     )
                  }
               >
                  <Badge
                     anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                     }}
                     overlap="circular"
                     badgeContent={
                        inTalentPool ? (
                           <SmallAvatar>
                              <HowToRegRoundedIcon color="primary" />
                           </SmallAvatar>
                        ) : (
                           0
                        )
                     }
                  >
                     <Avatar alt={`${firstName} ${lastName}`} src={avatarUrl}>
                        {firstName ? `${firstName[0] + lastName[0]}` : ""}
                     </Avatar>
                  </Badge>
               </Badge>
            </ListItemAvatar>
         </Tooltip>
         <ListItemText
            disableTypography
            primary={
               <Typography noWrap variant="body1" className={classes.secondary}>
                  {inTalentPool
                     ? `${firstName} ${lastName}`
                     : `${firstName} ${lastName?.[0]}`}
               </Typography>
            }
            secondary={
               <Tooltip title={university?.name || ""}>
                  <Typography
                     noWrap
                     color="textSecondary"
                     variant="body2"
                     className={classes.secondary}
                  >
                     {university?.name}
                  </Typography>
               </Tooltip>
            }
         />
         {inTalentPool && (
            <ListItemIcon className={classes.talentPoolIcon}>
               <IconButton edge="end" onClick={handleClick} size="large">
                  <MoreVertIcon />
               </IconButton>
            </ListItemIcon>
         )}
         <Menu
            id="fade-menu"
            anchorEl={anchorEl}
            keepMounted
            open={open}
            onClose={handleClose}
            PopoverClasses={{
               paper: classes.menu,
            }}
         >
            {menuItems
               .filter((item) => item.valid)
               .map(({ label, icon, onClick, valid, href, download }) => (
                  <MenuItem
                     className={classes.menuItem}
                     target="_blank"
                     component={href ? "a" : "li"}
                     href={href}
                     disabled={!valid}
                     key={label}
                     download={download}
                     onClick={onClick}
                  >
                     <ListItemIcon>{icon}</ListItemIcon>
                     {label}
                  </MenuItem>
               ))}
         </Menu>
      </ListItem>
   )
}
User.propTypes = {
   inTalentPool: PropTypes.bool.isRequired,
   style: PropTypes.object.isRequired,
   user: PropTypes.object.isRequired,
}

export default memo(User)
