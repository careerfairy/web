import React from "react";
import { alpha } from "@mui/material/styles";
import makeStyles from '@mui/styles/makeStyles';
import { Avatar, Box, Paper, Typography } from "@mui/material";
import { AvatarGroup } from '@mui/material';
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions";
import { grey } from "@mui/material/colors";

const useStyles = makeStyles((theme) => ({
   root: {},
   avatar: {
      borderColor: alpha(grey["400"], 0.8),
      boxShadow: theme.shadows[10],
      background: theme.palette.common.white,
      [theme.breakpoints.up("sm")]: {
         width: theme.spacing(12),
         height: theme.spacing(12),
      },
      "& img": {
         objectFit: "contain",
      },
   },
   companyRoot: {
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap-reverse",
   },
   companyAva: {
      padding: theme.spacing(2),
      borderRadius: theme.spacing(1),
      boxShadow: theme.shadows[4],
      background: theme.palette.common.white,
      width: "fit-content",
      height: "fit-content",
      "& img": {
         borderRadius: theme.spacing(1),
         maxHeight: 45,
         maxWidth: 140,
         objectFit: "contain",
      },
   },
   hostInfo: {
      padding: theme.spacing(1),
      color: theme.palette.common.white,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      height: "100%",
   },
   hostsCard: {
      display: "flex",
      flexDirection: "column",
      borderRadius: theme.spacing(1),
      width: "fit-content",
      background: "transparent",
      boxShadow: "none",
   },
   hostedText: {
      color: theme.palette.common.white,
   },
}));

const HeroHosts = ({ hosts }) => {
   const classes = useStyles();

   return hosts.length === 1 ? (
      <Paper className={classes.hostsCard}>
         <div className={classes.companyRoot}>
            <Avatar
               title={`${hosts[0].universityName || ""}`}
               className={classes.companyAva}
               variant="rounded"
               src={getResizedUrl(hosts[0].logoUrl, "sm")}
            />
            <div className={classes.hostInfo}>
               <Typography variant="body1">Hosted by</Typography>
               <Typography variant="h6">{hosts[0].universityName}</Typography>
            </div>
         </div>
      </Paper>
   ) : (
      <>
         <Typography variant="h6" gutterBottom className={classes.hostedText}>
            Hosted by
         </Typography>
         <Paper className={classes.hostsCard}>
            <AvatarGroup className={classes.root}>
               {hosts.map((host) => (
                  <Avatar
                     className={classes.avatar}
                     key={host.id}
                     variant="rounded"
                     src={getResizedUrl(host.logoUrl, "xs")}
                     title={`${host.universityName || ""}`}
                  />
               ))}
            </AvatarGroup>
         </Paper>
      </>
   );
};

export default HeroHosts;
