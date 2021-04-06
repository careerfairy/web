import React from 'react';
import {makeStyles, useTheme} from "@material-ui/core/styles";
import GeneralLayout from "../../layouts/GeneralLayout";
import SupportSection from "../../components/views/support/SupportSection";

const useStyles = makeStyles(theme => ({}));

const SupportPage = ({}) => {

    const {palette: {common: {white}, text: {primary}, navyBlue}} = useTheme()
    return (
        <GeneralLayout>
            <SupportSection
                color={white}
                backgroundColor={navyBlue.main}
                // backgroundImage={placeholderBackground}
                backgroundImageOpacity={0.5}
                title="CareerFairy Help Center"
                subtitle=""
            />
        </GeneralLayout>
    );
};

export default SupportPage;
