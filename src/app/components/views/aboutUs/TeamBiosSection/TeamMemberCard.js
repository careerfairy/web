import { Card, CardContent, Collapse } from "@mui/material";
import BioAvatar from "./BioAvatar";
import Typography from "@mui/material/Typography";
import React from "react";

const styles = {
   root: {
      width: "100%",
      borderRadius: 4,
   },
   avatar: (theme) => ({
      width: theme.spacing(20),
      height: theme.spacing(20),
      marginBottom: theme.spacing(2),
      "& img": {
         transition: theme.transitions.create(["all"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.short,
         }),
      },
   }),
   avatarHovered: {
      "& img": {
         transform: "scale(1.1)",
      },
   },
   greenBorder: {
      borderBottom: (theme) =>
         `${theme.spacing(1)} solid ${theme.palette.primary.dark}`,
   },
   bio: {
      whiteSpace: "pre-line",
   },
};
export const TeamMemberCard = (props) => {
   const [hovered, setHovered] = React.useState(false);

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
         onFocus={handleMouseEnter}
         raised={hovered}
         sx={[styles.root, hovered && styles.greenBorder]}
      >
         <CardContent align="center">
            <BioAvatar
               hovered={hovered}
               person={props.person}
               styles={styles}
            />
            <Typography variant="h5">{props.person.name}</Typography>
            <Typography gutterBottom color="textSecondary" variant="subtitle1">
               {props.person.role}
            </Typography>
            <Collapse in={hovered}>
               <Typography sx={styles.bio} paragraph>
                  {props.person.bio}
               </Typography>
            </Collapse>
         </CardContent>
      </Card>
   );
};
