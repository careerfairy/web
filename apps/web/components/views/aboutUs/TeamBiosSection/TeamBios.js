import PropTypes from "prop-types"
import React, { useEffect, useState } from "react"
import { useTheme } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import { Grid } from "@mui/material"
import { TeamMemberCard } from "./TeamMemberCard"
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import Bounce from "@stahl.luke/react-reveal/Bounce"

const useStyles = makeStyles((theme) => ({
   gridItem: {
      display: "flex",
   },
}))

TeamMemberCard.propTypes = {
   person: PropTypes.any,
   classes: PropTypes.any,
}
const TeamBios = ({ people }) => {
   const classes = useStyles()
   const [mounted, setMounted] = useState(false)
   const theme = useTheme()
   useEffect(() => {
      // Masonry library malfunctions on the server side, so mui grid is used initially
      setMounted(true)
   }, [])

   return mounted ? (
      <ResponsiveMasonry
         columnsCountBreakPoints={{ 350: 1, 600: 2, 1000: 3, 1450: 3, 1800: 4 }}
         style={{
            width: "100%",
         }}
      >
         <Masonry gutter={theme.spacing(2)}>
            {people.map((person, index) => (
               <Bounce
                  key={index}
                  delay={index % 2 !== 0 ? 200 : 0}
                  left={index % 2 === 0}
                  right={index % 2 !== 0}
               >
                  <TeamMemberCard
                     key={index}
                     person={person}
                     classes={classes}
                  />
               </Bounce>
            ))}
         </Masonry>
      </ResponsiveMasonry>
   ) : (
      <Grid
         sx={{ width: "100%", minHeight: 400 }}
         container
         justifyContent="center"
         spacing={4}
      >
         {people.map((person, index) => (
            <Grid
               item
               className={classes.gridItem}
               xs={12}
               sm={12}
               md={6}
               lg={4}
               xl={3}
               key={index}
            >
               <TeamMemberCard person={person} classes={classes} />
            </Grid>
         ))}
      </Grid>
   )
}

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
}
export default TeamBios
