import { Card, CardContent, Collapse } from "@mui/material";
import BioAvatar from "./BioAvatar";
import Typography from "@mui/material/Typography";
import React from "react";
import makeStyles from '@mui/styles/makeStyles';
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
   root: {
      width: "100%",
   },
   avatar: {
      width: theme.spacing(20),
      height: theme.spacing(20),
      marginBottom: theme.spacing(2),
      "& img": {
         transition: theme.transitions.create(["all"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.short,
         }),
      },
   },
   avatarHovered: {
      "& img": {
         transform: "scale(1.1)",
      },
   },
   greenBorder: {
      borderBottom: `${theme.spacing(0.5)} solid ${
         theme.palette.primary.dark
      }`,
   },
   bio: {
      whiteSpace: "pre-line",
   },
}));
export const TeamMemberCard = (props) => {
   const [hovered, setHovered] = React.useState(false);

   const classes = useStyles();

   const handleMouseEnter = () => {
      setHovered(true);
   };
   const handleMouseLeave = () => {
      setHovered(false);
   };

   return (
      <Card
         onMouseEnter={handleMouseEnter}
         onMouseLeave={handleMouseLeave}
         raised={hovered}
         className={clsx(classes.root, {
            [classes.greenBorder]: hovered,
         })}
      >
         <CardContent align="center">
            <BioAvatar
               hovered={hovered}
               person={props.person}
               classes={classes}
            />
            <Typography variant="h5">{props.person.name}</Typography>
            <Typography gutterBottom color="textSecondary" variant="subtitle1">
               {props.person.role}
            </Typography>
            <Collapse in={hovered}>
               <Typography className={classes.bio} paragraph>
                  {props.person.bio}
               </Typography>
            </Collapse>
         </CardContent>
      </Card>
   );
};
