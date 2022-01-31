import React, { useState } from "react";
import {
   Box,
   Button,
   Card,
   CardContent,
   CardMedia,
   Container,
   Typography,
   CircularProgress,
} from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import DisplayCategoryElement from "./DisplayCategoryElement";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/router";

const useStyles = makeStyles((theme) => ({
   root: {
      paddingTop: "50px",
      paddingBottom: "50px",
   },
   title: {
      fontWeight: "300",
      color: "rgb(0, 210, 170)",
      fontSize: "calc(1.2em + 1.5vw)",
   },
   actions: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
   },
   buttons: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "15px",
   },
   media: {
      display: "flex",
      justifyContent: "center",
      padding: "1.5em 1em 1em 1em",
      height: "120px",
   },
   image: {
      objectFit: "contain",
      maxWidth: "80%",
   },
}));

const CompleteGroup = ({
   handleBack,
   baseGroupInfo,
   createCareerCenter,
   arrayOfCategories,
   setActiveStep,
}) => {
   const [submitting, setSubmitting] = useState(false);
   const classes = useStyles();

   const handleFinalize = async () => {
      setSubmitting(true);
      createCareerCenter();
   };

   const categories = arrayOfCategories.map((category, index) => {
      return (
         <DisplayCategoryElement
            setActiveStep={setActiveStep}
            key={index}
            category={category}
         />
      );
   });

   return (
      <Container className={classes.root}>
         <Typography align="center" className={classes.title}>
            Last Check
         </Typography>
         <div>
            <Typography variant="h5" gutterBottom>
               Details:
            </Typography>
            <Card>
               <CardMedia className={classes.media}>
                  <img
                     className={classes.image}
                     alt={`${baseGroupInfo.universityName} logo`}
                     src={baseGroupInfo.logoUrl}
                  />
               </CardMedia>
               <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                     {baseGroupInfo.universityName}
                  </Typography>
                  <Typography
                     variant="body2"
                     color="textSecondary"
                     component="p"
                  >
                     {baseGroupInfo.description}
                  </Typography>
               </CardContent>
            </Card>
            <Typography style={{ marginTop: 10 }} variant="h5" gutterBottom>
               Categories:
            </Typography>
            <div className="category-wrapper">{categories}</div>
            {categories.length === 0 && <Typography>No categories</Typography>}
            <div className={classes.actions}>
               <Typography gutterBottom align="center">
                  Are you satisfied?
               </Typography>
               <Box className={classes.buttons}>
                  <Button
                     variant="contained"
                     size="large"
                     style={{ marginRight: 5 }}
                     onClick={handleBack}
                  >
                     Back
                  </Button>
                  <Button
                     onClick={handleFinalize}
                     color="primary"
                     style={{ marginLeft: 5 }}
                     disabled={submitting}
                     endIcon={
                        submitting && (
                           <CircularProgress size={20} color="inherit" />
                        )
                     }
                     variant="contained"
                     size="large"
                  >
                     Finish
                  </Button>
               </Box>
            </div>
         </div>
      </Container>
   );
};

export default CompleteGroup;
