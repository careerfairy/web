import PropTypes from 'prop-types'
import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Container, Grid, Hidden} from "@material-ui/core";
import SupportNav from "../SupportNav";

const useStyles = makeStyles(theme => ({
    root: {
        zIndex: 1,
        "&.MuiContainer-root": {
            position: "relative"
        },

    },
}));

const SupportContainer = ({withNav, children}) => {

    const classes = useStyles()

    return (
        <Container className={classes.root}>
            <Grid
                container
                spacing={4}
            >
                <Hidden smDown>
                    <Grid md={3} item>
                        <SupportNav/>
                    </Grid>
                </Hidden>
                <Grid xs={12} sm={12} md={7} item>
                    {children}
                </Grid>
            </Grid>
        </Container>
    );
};

export default SupportContainer;

SupportContainer.propTypes = {
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]).isRequired,
    withNav: PropTypes.bool,
}