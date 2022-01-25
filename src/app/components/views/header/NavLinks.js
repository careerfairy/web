import React from "react";
import { Tab, Tabs, Typography } from "@mui/material";
import Link from "../../../materialUI/NextNavLink";
import { useRouter } from "next/router";

const NavLinks = ({ links, navLinksActiveColor, navLinksBaseColor }) => {
   const { pathname } = useRouter();
   return (
      <Tabs
         sx={{
            display: "flex",
            justifyContent: "space-around",
         }}
         value={false}
      >
         {links.map((item) => (
            <Tab
               key={item.title}
               sx={(theme) => ({
                  textDecoration: "none !important",
                  textTransform: "uppercase",
                  color: navLinksBaseColor || theme.palette.common.black,
                  padding: 0,
                  opacity: 1,
                  minWidth: "72px",
                  margin: theme.spacing(0, 4),
                  transition: theme.transitions.create(["color"], {
                     easing: theme.transitions.easing.sharp,
                     duration: theme.transitions.duration.shortest,
                  }),
                  "&:before": {
                     borderRadius: theme.spacing(1),
                     content: '""',
                     position: "absolute",
                     width: "40px",
                     height: "2px",
                     bottom: "8px",
                     right: 0,
                     backgroundColor: navLinksActiveColor,
                     visibility: "visible",
                     WebkitTransform: "scaleX(1)",
                     transform: "scaleX(1)",
                     transition: theme.transitions.create(["all"], {
                        easing: theme.transitions.easing.easeInOut,
                        duration: theme.transitions.duration.shortest,
                     }),
                  },
                  "&:hover": {
                     color: navLinksActiveColor,
                  },
                  "&:hover:before": {
                     bottom: "6px",
                     height: "4px",
                     width: "100%",
                  },
                  ...(pathname === item.href && {
                     color: navLinksActiveColor,
                     "&:before": {
                        content: '""',
                        position: "absolute",
                        width: "100%",
                        height: "4px",
                        bottom: "6px",
                        left: 0,
                        backgroundColor: navLinksActiveColor,
                        visibility: "visible",
                        WebkitTransform: "scaleX(1)",
                        transform: "scaleX(1)",
                     },
                  }),
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
