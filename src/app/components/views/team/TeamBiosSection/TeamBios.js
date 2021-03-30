import PropTypes from 'prop-types'
import React from 'react';
import {makeStyles, useTheme} from "@material-ui/core/styles";
import {Grid} from "@material-ui/core";
import {TeamMemberCard} from "./TeamMemberCard";
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"

const useStyles = makeStyles(theme => ({

    gridItem: {
      display: 'flex',
    }
}));


TeamMemberCard.propTypes = {
    person: PropTypes.any,
    classes: PropTypes.any
};
const TeamBios = ({people}) => {

    const classes = useStyles()
    const theme = useTheme()

    return (
        <ResponsiveMasonry
            columnsCountBreakPoints={{350: 1, 800: 2, 1280: 2, 1450: 2}}

        >
            <Masonry gutter={`${theme.spacing(4)}px`}>
                {people.map((person) => (
                    <TeamMemberCard person={person} key={person.name} classes={classes}/>
                ))}
            </Masonry>
        </ResponsiveMasonry>
    )
    // return (
    //     <Grid
    //         container
    //           justify="center"
    //           spacing={4}>
    //         {people.map((person, index) => (
    //             <Grid
    //                 item
    //                 className={classes.gridItem}
    //                 xs={12}
    //                 sm={12}
    //                 md={6}
    //                 key={index}
    //             >
    //                 <TeamMemberCard person={person} classes={classes}/>
    //             </Grid>
    //         ))}
    //     </Grid>
    // );
};

TeamBios.propTypes = {
    people: PropTypes.arrayOf(PropTypes.shape({
        avatar: PropTypes.string,
        name: PropTypes.string,
        role: PropTypes.string,
        bio: PropTypes.string,
        twitterUrl: PropTypes.string,
        facebookUrl: PropTypes.string,
        linkedinUrl: PropTypes.string,
    }))
}
export default TeamBios;

