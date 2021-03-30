import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import TopBar from "./TopBar";
import SideBar from "./SideBar";

const useStyles = makeStyles(theme => ({}));

const NewHeader = ({}) => {

    const classes = useStyles()

    return (
        <React.Fragment>
            <TopBar/>
            <SideBar/>
        </React.Fragment>
    );
};

export default NewHeader;
