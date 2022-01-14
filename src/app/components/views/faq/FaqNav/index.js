import React from 'react';
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({}));

const navData = [
    {
        title: "Getting Started",
        href: "/faq/getting-started"
    },
    {
        title: "Technical requirements",
        href: "/faq/technical-requirements"
    },

]

const FaqNav = ({}) => {

    const classes = useStyles()

    return (
        <div>
            
        </div>
    );
};

export default FaqNav;
