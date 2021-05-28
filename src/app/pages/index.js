import React from 'react';
import {makeStyles, useTheme} from "@material-ui/core/styles";
import LandingLayout from "../layouts/LandingLayout";
import BookADemoSection from "../components/views/landing/BookADemoSection";

const useStyles = makeStyles(theme => ({}));

const LandingPage = ({}) => {

    const {palette: {secondary, common}} = useTheme()

    return (
        <LandingLayout>
            <BookADemoSection
                backgroundColor={`linear-gradient(-8deg, ${secondary.main} 1%, ${secondary.light} 100%)`}
                color={common.white}
                title={"Interesting?"}
            />
        </LandingLayout>
    );
};

export default LandingPage;
