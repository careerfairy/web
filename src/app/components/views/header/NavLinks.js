import React from "react";
import makeStyles from '@mui/styles/makeStyles';
import { Tab, Tabs, Typography } from "@mui/material";
import clsx from "clsx";
import Link from "../../../materialUI/NextNavLink";
import { useRouter } from "next/router";

const useStyles = makeStyles((theme) => ({
   root: {},
   tabs: {
      display: "flex",
      justifyContent: "space-around",
   },
   indicator: {
      background: (props) => props.navLinksActiveColor,
      color: (props) => props.navLinksActiveColor,
   },
   navLinks: {
      textDecoration: "none !important",
      textTransform: "uppercase",
      color: (props) => props.navLinksBaseColor || theme.palette.common.black,
      padding: 0,
      opacity: 1,
      minWidth: 72,
      margin: theme.spacing(0, 4),
      transition: theme.transitions.create(["color"], {
         easing: theme.transitions.easing.sharp,
         duration: theme.transitions.duration.shortest,
      }),
      "&:before": {
         borderRadius: theme.spacing(1),
         content: '""',
         position: "absolute",
         width: 40,
         height: 2,
         bottom: 8,
         right: 0,
         backgroundColor: (props) => props.navLinksActiveColor,
         visibility: "visible",
         WebkitTransform: "scaleX(1)",
         transform: "scaleX(1)",
         transition: theme.transitions.create(["all"], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.shortest,
         }),
      },
      "&:hover": {
         color: (props) => props.navLinksActiveColor,
      },
      "&:hover:before": {
         bottom: 6,
         height: 4,
         width: "100%",
      },
   },

   active: {
      color: (props) => props.navLinksActiveColor,
      "&:before": {
         content: '""',
         position: "absolute",
         width: "100%",
         height: 4,
         bottom: 6,
         left: "0",
         backgroundColor: (props) => props.navLinksActiveColor,
         visibility: "visible",
         WebkitTransform: "scaleX(1)",
         transform: "scaleX(1)",
      },
   },
}));
const NavLinks = ({ links, navLinksActiveColor, navLinksBaseColor }) => {
   const classes = useStyles({ navLinksActiveColor, navLinksBaseColor });
   const { pathname } = useRouter();
   return (
      <Tabs
         className={classes.tabs}
         value={false}
         classes={{ indicator: classes.indicator }}
      >
         {links.map((item) => (
            <Tab
               key={item.title}
               className={clsx(classes.navLinks, {
                  [classes.active]: pathname === item.href,
               })}
               component={Link}
               disableRipple
               label={
                  <Typography style={{ fontWeight: 800 }} variant="h6">
                     {item.title}
                  </Typography>
               }
               href={item.href}
            />
         ))}
      </Tabs>
   );
};

export default NavLinks;
