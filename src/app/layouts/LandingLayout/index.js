import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import TopBar from "./TopBar";

const useStyles = makeStyles(theme => ({}));

const LandingLayout = ({children}) => {

    const classes = useStyles()

    return (
        <React.Fragment>
            <TopBar/>
            {children}
        </React.Fragment>
    );
};

export default LandingLayout;
