import React from "react";
import { alpha } from "@mui/material/styles";
import { Avatar, AvatarGroup, Box, Paper, Typography } from "@mui/material";
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions";
import { grey } from "@mui/material/colors";

const styles = {
   root: {},
   avatar: (theme) => ({
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
   }),
   companyRoot: {
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap-reverse",
   },
   companyAva: (theme) => ({
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
   }),
   hostInfo: {
      padding: (theme) => theme.spacing(1),
      color: (theme) => theme.palette.common.white,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      height: "100%",
   },
   hostsCard: {
      display: "flex",
      flexDirection: "column",
      borderRadius: (theme) => theme.spacing(1),
      width: "fit-content",
      background: "transparent",
      boxShadow: "none",
   },
   hostedText: {
      color: (theme) => theme.palette.common.white,
   },
};

const HeroHosts = ({ hosts }) => {
   return hosts.length === 1 ? (
      <Paper sx={styles.hostsCard}>
         <Box sx={styles.companyRoot}>
            <Avatar
               title={`${hosts[0].universityName || ""}`}
               sx={styles.companyAva}
               variant="rounded"
               src={getResizedUrl(hosts[0].logoUrl, "sm")}
            />
            <Box sx={styles.hostInfo}>
               <Typography variant="body1">Hosted by</Typography>
               <Typography variant="h6">{hosts[0].universityName}</Typography>
            </Box>
         </Box>
      </Paper>
   ) : (
      <>
         <Typography variant="h6" gutterBottom sx={styles.hostedText}>
            Hosted by
         </Typography>
         <Paper sx={styles.hostsCard}>
            <AvatarGroup sx={styles.root}>
               {hosts.map((host) => (
                  <Avatar
                     sx={styles.avatar}
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
