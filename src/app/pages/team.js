import React from 'react';
import GeneralLayout from "../layouts/GeneralLayout";
import HeroSection from "../components/views/team/HeroSection";
import TeamBiosSection from "../components/views/team/TeamBiosSection";
import {useTheme} from "@material-ui/core/styles";

const placeholderBackground = "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2F6098fdd8-f209-4736-8db7-d86025eb1806_CF.PNG?alt=media"
const TeamPage = () => {
    const {palette: {common: {white}, text: {primary}, navyBlue}} = useTheme()
    return (
        <GeneralLayout>
            <HeroSection
                color={white}
                backgroundColor={navyBlue.main}
                backgroundImage={placeholderBackground}
                backgroundImageOpacity={0.5}
                title="We help you make money"
                subtitle="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolorum consequatur numquam aliquam tenetur ad amet inventore hic beatae, quas accusantium perferendis sapiente explicabo, corporis totam!"
            />
            <TeamBiosSection
                color={primary}
                // backgroundColor={}
                backgroundImage=""
                backgroundImageOpacity={1}
                title="Meet the Team"
                subtitle=""
            />
        </GeneralLayout>
    );
};

export default TeamPage;
