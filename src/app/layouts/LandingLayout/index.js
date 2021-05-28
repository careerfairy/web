import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import TopBar from "./TopBar";
import styles from "../../materialUI/styles/layoutStyles/landingLayoutStyles";
import FooterV2 from "../../components/views/footer/FooterV2";

const useStyles = makeStyles(styles);

const LandingLayout = ({children}) => {

    const classes = useStyles()

    return (
        <React.Fragment>
            <div className={classes.root}>
                <TopBar/>
                <div className={classes.wrapper}>
                    <div className={classes.contentContainer}>
                        <div className={classes.content}>
                            {children}
                            <FooterV2/>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default LandingLayout;
