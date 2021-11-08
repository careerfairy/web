import {
   Avatar,
   Card,
   CardActionArea,
   CardHeader,
   IconButton,
   Typography,
} from "@material-ui/core";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import EditIcon from "@material-ui/icons/Edit";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
   root: {
      width: 200,
   },
   cover: {
      height: 300,
      width: "100%",
      "& img": {
         objectFit: "contain",
         maxWidth: "90%",
         maxHeight: "90%",
      },
   },
   selected: {
      border: `4px solid ${theme.palette.primary.main}`,
   },
}));

const EmailTemplateCard = ({
   templateImageUrl,
   templateName,
   onClick,
   selected,
}) => {
   const classes = useStyles();
   return (
      <Card
         className={clsx(classes.root, {
            [classes.selected]: selected,
         })}
      >
         <CardActionArea onClick={onClick}>
            <CardHeader
               action={
                  <IconButton
                     href="https://account.postmarkapp.com/servers/5274171/templates/25653565/edit"
                     target="_blank"
                     aria-label="edit-template"
                  >
                     <EditIcon />
                  </IconButton>
               }
               title={
                  <Typography variant="h6" color="textSecondary">
                     {templateName}
                  </Typography>
               }
            />
            <Avatar
               className={classes.cover}
               src={templateImageUrl}
               title={templateName}
               variant="square"
            />
         </CardActionArea>
      </Card>
   );
};

export default EmailTemplateCard;
