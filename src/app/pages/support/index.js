import React from 'react';
import {makeStyles, useTheme} from "@material-ui/core/styles";
import GeneralLayout from "../../layouts/GeneralLayout";
import SupportSection from "../../components/views/support/SupportSection";

const useStyles = makeStyles(theme => ({}));

const supportBanner = "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/support-illustrations%2Fsupport-banner.svg?alt=media&token=23ca911c-9151-4831-9eb1-c13f1ed6fe20"

const SupportPage = ({}) => {

    const {palette: {common: {white}, text: {primary}, navyBlue}} = useTheme()
    return (
        <GeneralLayout>
            <SupportSection
                color={white}
                backgroundColor={navyBlue.main}
                backgroundImage={supportBanner}
                backgroundImageOpacity={0.5}
                hasSearch
                supportTitle="Help Desk"
                title="CareerFairy Help Center"
                subtitle=""
            />
        </GeneralLayout>
    );
};

export default SupportPage;
