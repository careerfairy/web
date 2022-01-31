import React from "react";
import { Avatar, Box, Card, Grid, Typography } from "@mui/material";
import { getResizedUrl } from "../../../../../helperFunctions/HelperFunctions";

const cardSpacing = 3;
const styles = {
   avatar: {
      width: 170,
      height: 170,
      "& img": {
         objectFit: "cover",
      },
   },
   cardAuthor: {
      fontWeight: 600,
      margin: 0,
      display: "-webkit-box",
      boxOrient: "vertical",
      lineClamp: 3,
      WebkitLineClamp: 3,
      wordBreak: "break-word",
      overflow: "hidden",
   },
   cardRoot: {
      display: "flex",
      borderRadius: cardSpacing,
      flexWrap: "wrap",
   },
   companyImage: {
      height: 130,
      borderRadius: cardSpacing,
      width: "50%",
      margin: "auto 0",
      background: (theme) => theme.palette.common.white,
      "& img": {
         objectFit: "contain",
      },
   },
   speakerDetails: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "center",
      padding: (theme) => theme.spacing(1),
   },
   aboutWrapper: {
      padding: (theme) => theme.spacing(2),
      height: 92,
      display: "flex",
      justifyContent: "center",
      flexDirection: "column",
      alignItems: "center",
   },
};

const SpeakerCard = ({
   avatarUrl,
   companyName,
   position,
   name,
   companyUrl,
}) => {
   return (
      <Card elevation={0} sx={styles.cardRoot}>
         <Grid container spacing={3}>
            <Grid item xs={12}>
               <Box sx={styles.speakerDetails}>
                  <Avatar
                     src={getResizedUrl(avatarUrl, "sm")}
                     alt={name}
                     sx={styles.avatar}
                  />
                  <Box sx={styles.aboutWrapper}>
                     <Typography
                        component="h4"
                        variant="subtitle1"
                        sx={styles.cardAuthor}
                     >
                        {name}
                     </Typography>
                     <Typography
                        variant="body2"
                        color="textSecondary"
                        align="center"
                        sx={styles.cardAuthor}
                        component="p"
                     >
                        {position}
                     </Typography>
                  </Box>
                  <Avatar
                     src={getResizedUrl(companyUrl, "sm")}
                     sx={styles.companyImage}
                     alt={companyName}
                  />
               </Box>
            </Grid>
         </Grid>
      </Card>
   );
};

export default SpeakerCard;
