import React from "react";
import {
   Avatar,
   Box,
   Card,
   CardContent,
   CardHeader,
   Grid,
   Typography,
} from "@mui/material";

const styles = {
   root: (theme) => ({
      display: "flex",
      position: "relative",
      justifyContent: "center",
      padding: theme.spacing(5),
      [theme.breakpoints.down("md")]: {
         padding: theme.spacing(1),
      },
   }),
   backgroundRect: (theme) => ({
      top: "50%",
      left: "56%",
      width: "86%",
      height: "94%",
      position: "absolute",
      transform: "translate(-50%, -50%)",
      background: "#E1F0EE",
      borderRadius: "2rem",
      [theme.breakpoints.down("md")]: {
         left: "50%",
         width: "99%",
      },
      boxShadow: theme.shadows[1],
   }),
   innerWrapper: {
      zIndex: 2,
      flex: 1,
      display: "flex",
      width: "90%",
   },
   wrapper: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
   },
   avatar: {
      width: "170px",
      height: "170px",
      borderRadius: "50px",
      "& img": {
         objectFit: "contain",
      },
      boxShadow: (theme) => theme.shadows[4],
   },
   cardHeaderWrapper: {
      display: "flex",
      flexWrap: "wrap",
   },
   cardTitle: {
      fontWeight: 600,
      marginRight: (theme) => theme.spacing(2),
   },
   rating: {
      fontSize: (theme) => theme.spacing(4),
   },
   cardReview: {
      marginBottom: (theme) => theme.spacing(2),
      whiteSpace: "pre-line",
   },
   cardAuthor: {
      fontWeight: 600,
   },
   cardRoot: {
      background: "transparent",
      boxShadow: "none",
   },
   companyImage: (theme) => ({
      width: "170px",
      height: "auto",
      borderRadius: "10px",
      background: theme.palette.common.white,
      "& img": {
         objectFit: "contain",
      },
      padding: theme.spacing(1.5),
      boxShadow: theme.shadows[2],
      marginTop: theme.spacing(2),
   }),
};

const TestimonialCard = ({
   avatarUrl,
   title,
   // rating,
   position,
   name,
   reviewText,
   companyUrl,
}) => {
   return (
      <Box sx={styles.root}>
         <Box sx={styles.backgroundRect} />
         <Box sx={styles.innerWrapper}>
            <Grid container>
               <Grid xs={12} md={4} lg={3} item>
                  <Box sx={styles.wrapper}>
                     <Avatar
                        src={avatarUrl}
                        variant="square"
                        sx={styles.avatar}
                     />
                  </Box>
               </Grid>
               <Grid xs={12} md={8} lg={9} item>
                  <Box sx={styles.wrapper}>
                     <Card sx={styles.cardRoot}>
                        <CardHeader
                           title={
                              <Box sx={styles.cardHeaderWrapper}>
                                 <Typography
                                    component="h2"
                                    sx={styles.cardTitle}
                                    variant="h5"
                                 >
                                    {`“${title}”`}
                                 </Typography>
                                 {/*<Rating*/}
                                 {/*    defaultValue={2}*/}
                                 {/*    sx={styles.rating}*/}
                                 {/*    name="testimonial-rating"*/}
                                 {/*    value={rating}*/}
                                 {/*/>*/}
                              </Box>
                           }
                        />
                        <CardContent>
                           <Typography
                              sx={styles.cardReview}
                              variant="body2"
                              component="p"
                           >
                              {reviewText}
                           </Typography>
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
                              sx={styles.cardAuthor}
                              component="p"
                           >
                              {position}
                           </Typography>
                           <Avatar src={companyUrl} sx={styles.companyImage} />
                        </CardContent>
                     </Card>
                  </Box>
               </Grid>
            </Grid>
         </Box>
      </Box>
   );
};

export default TestimonialCard;
