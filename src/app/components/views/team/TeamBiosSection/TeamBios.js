import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";
import { TeamMemberCard } from "./TeamMemberCard";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import Bounce from "react-reveal/Bounce";

const useStyles = makeStyles((theme) => ({
   gridItem: {
      display: "flex",
   },
}));

TeamMemberCard.propTypes = {
   person: PropTypes.any,
   classes: PropTypes.any,
};
const TeamBios = ({ people }) => {
   const classes = useStyles();
   const [mounted, setMounted] = useState(false);
   const theme = useTheme();
   useEffect(() => {
      // Masonry library malfunctions on the server side, so mui grid is used initially
      setMounted(true);
   }, []);

   return mounted ? (
      <ResponsiveMasonry
         columnsCountBreakPoints={{ 350: 1, 800: 2, 1280: 2, 1450: 3 }}
      >
         <Masonry gutter={`${theme.spacing(4)}px`}>
            {people.map((person, index) => (
               <Bounce
                  key={person.id}
                  delay={index % 2 !== 0 ? 300 : 0}
                  left={index % 2 === 0}
                  right={index % 2 !== 0}
               >
                  <TeamMemberCard
                     key={person.id}
                     person={person}
                     classes={classes}
                  />
               </Bounce>
            ))}
         </Masonry>
      </ResponsiveMasonry>
   ) : (
      <Grid container justify="center" spacing={4}>
         {people.map((person, index) => (
            <Grid
               item
               className={classes.gridItem}
               xs={12}
               sm={12}
               md={6}
               lg={4}
               key={person.id}
            >
               <TeamMemberCard person={person} classes={classes} />
            </Grid>
         ))}
      </Grid>
   );
};

TeamBios.propTypes = {
   people: PropTypes.arrayOf(
      PropTypes.shape({
         avatar: PropTypes.string,
         name: PropTypes.string,
         role: PropTypes.string,
         bio: PropTypes.string,
         twitterUrl: PropTypes.string,
         facebookUrl: PropTypes.string,
         linkedinUrl: PropTypes.string,
      })
   ),
};
export default TeamBios;
