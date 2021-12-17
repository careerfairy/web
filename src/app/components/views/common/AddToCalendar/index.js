import PropTypes from "prop-types";
import React, { useMemo, useState } from "react";
import {
   Avatar,
   ListItemIcon,
   ListItemText,
   Menu,
   MenuItem,
} from "@material-ui/core";
import { makeUrls } from "../../../../util/makeUrls";
import {
   appleIcon,
   googleIcon,
   outlookBlueIcon,
   outlookYellowIcon,
   yahooIcon,
} from "../../../../constants/svgs";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
   avatar: {
      borderRadius: 0,
      width: theme.spacing(3),
      height: theme.spacing(3),
      "& img": {
         objectFit: "contain",
      },
   },
}));

const LinkMenuItem = ({ children, filename = false, href, ...rest }) => (
   <MenuItem
      download={filename}
      href={href}
      dense
      target="_blank"
      rel="noopener noreferrer"
      component="a"
      {...rest}
   >
      {children}
   </MenuItem>
);

const Dropdown = ({ filename, handleClose, anchorEl, urls }) => {
   const classes = useStyles();
   return (
      <Menu
         id="add to calendar menu"
         anchorEl={anchorEl}
         keepMounted
         open={Boolean(anchorEl)}
         onClose={handleClose}
      >
         <LinkMenuItem
            onClick={handleClose}
            download={filename}
            href={urls.ics}
         >
            <ListItemIcon>
               <Avatar className={classes.avatar} src={appleIcon} />
            </ListItemIcon>
            <ListItemText primary="Apple Calendar" />
         </LinkMenuItem>
         <LinkMenuItem href={urls.google} onClick={handleClose}>
            <ListItemIcon>
               <Avatar className={classes.avatar} src={googleIcon} />
            </ListItemIcon>
            <ListItemText primary="Google" />
         </LinkMenuItem>
         <LinkMenuItem
            href={urls.ics}
            download={filename}
            onClick={handleClose}
         >
            <ListItemIcon>
               <Avatar className={classes.avatar} src={outlookYellowIcon} />
            </ListItemIcon>
            <ListItemText primary="Outlook" />
         </LinkMenuItem>
         <LinkMenuItem href={urls.outlook} onClick={handleClose}>
            <ListItemIcon>
               <Avatar className={classes.avatar} src={outlookBlueIcon} />
            </ListItemIcon>
            <ListItemText primary="Outlook Web App" />
         </LinkMenuItem>
         <LinkMenuItem href={urls.yahoo} onClick={handleClose}>
            <ListItemIcon>
               <Avatar className={classes.avatar} src={yahooIcon} />
            </ListItemIcon>
            <ListItemText primary="Yahoo" />
         </LinkMenuItem>
      </Menu>
   );
};

export const AddToCalendar = ({ children, event, filename = "download" }) => {
   const [anchorEl, setAnchorEl] = useState(null);
   const urls = useMemo(() => makeUrls(event), [event]);

   const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
   };
   const handleClose = () => {
      setAnchorEl(null);
   };

   return (
      <div>
         <>
            {children(handleClick)}
            <Dropdown
               filename={filename}
               anchorEl={anchorEl}
               handleClose={handleClose}
               urls={urls}
            />
         </>
      </div>
   );
};

AddToCalendar.propTypes = {
   children: PropTypes.any.isRequired,
   event: PropTypes.shape({
      name: PropTypes.string,
      details: PropTypes.string,
      location: PropTypes.string,
      startsAt: PropTypes.string,
      endsAt: PropTypes.string,
   }),
   filename: PropTypes.string,
};
