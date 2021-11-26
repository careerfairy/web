import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Avatar, Box, Card, Grid, Typography } from "@material-ui/core";
import { getResizedUrl } from "../../../../../helperFunctions/HelperFunctions";

const useStyles = makeStyles((theme) => {
   const cardSpacing = theme.spacing(3);
   return {
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
         width: "100%",
         background: theme.palette.common.white,
         "& img": {
            objectFit: "contain",
         },
         padding: theme.spacing(1.5),
      },
      speakerDetails: {
         display: "flex",
         flexDirection: "column",
         justifyContent: "space-between",
         alignItems: "center",
         padding: theme.spacing(1),
      },
      aboutWrapper: {
         padding: theme.spacing(2),
         height: 92,
         display: "flex",
         justifyContent: "center",
         flexDirection: "column",
         alignItems: "center",
      },
   };
});

const SpeakerCard = ({
   avatarUrl,
   companyName,
   position,
   name,
   companyUrl,
}) => {
   const classes = useStyles();

   return (
      <Card elevation={0} className={classes.cardRoot}>
         <Grid container spacing={3}>
            <Grid item xs={12}>
               <div className={classes.speakerDetails}>
                  <Avatar
                     src={getResizedUrl(avatarUrl, "sm")}
                     alt={name}
                     className={classes.avatar}
                  />
                  <Box className={classes.aboutWrapper}>
                     <Typography
                        component="h4"
                        variant="subtitle1"
                        className={classes.cardAuthor}
                     >
                        {name}
                     </Typography>
                     <Typography
                        variant="body2"
                        color="textSecondary"
                        align="center"
                        className={classes.cardAuthor}
                        component="p"
                     >
                        {position}
                     </Typography>
                  </Box>
                  <Avatar
                     src={getResizedUrl(companyUrl, "sm")}
                     className={classes.companyImage}
                     alt={companyName}
                  />
               </div>
            </Grid>
         </Grid>
      </Card>
   );
};

export default SpeakerCard;
