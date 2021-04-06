import PropTypes from 'prop-types'
import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Grid, Typography} from "@material-ui/core";
import SupportSectionCard from "./SupportSectionCard";

const useStyles = makeStyles(theme => ({}));

const sections = [
    {
        title: 'FAQ',
        description: 'Frequently Asked Questions. Looking for something? Start here.',
        href: '#',
        image: 'https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/support-illustrations%2Ffaq-image.svg?alt=media&token=bfda6c98-d615-42ae-ab0a-11208bcf5a3d'
    }
]

const Support = ({title}) => {

    const classes = useStyles()

    return (
        <React.Fragment>
            <Grid spacing={3} container>
                {title &&
                <Grid item xs={12}>
                    <Typography color="inherit" variant="h3" className={classes.title}>
                        {title}
                    </Typography>
                </Grid>}
                {sections.map(section => (
                    <Grid item xs={12} md={6} lg={4} key={section.title}>
                        <SupportSectionCard section={section}/>
                    </Grid>
                ))}
            </Grid>
        </React.Fragment>
    );
};

export default Support;

Support.propTypes = {
    title: PropTypes.string
}