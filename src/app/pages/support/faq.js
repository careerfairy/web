import React from 'react';
import {useTheme} from "@mui/material/styles";
import GeneralLayout from "../../layouts/GeneralLayout";
import FaqSection from "../../components/views/faq/FaqSection";
const placeholderBackground = "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2F6098fdd8-f209-4736-8db7-d86025eb1806_CF.PNG?alt=media"

const FaqPage = () => {
    const {palette: {common: {white}, text: {primary}, navyBlue}} = useTheme()
    return (
        <GeneralLayout>
            <FaqSection
                color={white}
                backgroundColor={navyBlue.main}
                backgroundImage={placeholderBackground}
                backgroundImageOpacity={0.5}
                title="Frequently Asked Questions"
                subtitle=""
            />
        </GeneralLayout>
    );
};

export default FaqPage;
