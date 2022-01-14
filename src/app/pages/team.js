import React from "react";
import HeroSection from "../components/views/team/HeroSection";
import TeamBiosSection from "../components/views/team/TeamBiosSection";
import { useTheme } from "@material-ui/core/styles";
import UpcomingLayout from "../layouts/UpcomingLayout";
import ValuesSection from "../components/views/team/ValuesSection";
import { honestyShape, ideaShape, qualityShape } from "../constants/images";

const placeholderBackground =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2F6098fdd8-f209-4736-8db7-d86025eb1806_CF.PNG?alt=media";
const teamPhoto =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Fteam-photo.jpeg?alt=media&token=42a24b6a-8b26-4493-a460-75fb20e11bf9";
const TeamPage = () => {
   const {
      palette: {
         common: { white },
         navyBlue,
         background,
      },
   } = useTheme();

   const valuesData = [
      {
         name: "Start-up mentality",
         description:
            "We believe in breaking \n" +
            "boundaries and having fun \n" +
            "along the way.",
         imageUrl: ideaShape,
      },
      {
         name: "Quality",
         description:
            "We aim to provide the best \n" +
            "Live Stream qualify for both \n" +
            "talents and companies.",
         imageUrl: qualityShape,
      },
      {
         name: "Honesty",
         description:
            "We embrace honesty in our \n" +
            "workspace to generate new \n" +
            "ideas and a strong environment.",
         imageUrl: honestyShape,
      },
   ];
   return (
      <UpcomingLayout>
         <HeroSection
            color={white}
            backgroundColor={navyBlue.main}
            // backgroundImage={placeholderBackground}
            backgroundImagePosition="top"
            backgroundImage={teamPhoto}
            backgroundImageOpacity={0.2}
            title="About Us"
            subtitle="CareerFairy was launched in the summer of 2019 and is an ETH Zurich spinoff."
            bodyText="We are a fast-growing HR-Tech startup with the mission to empower talents from all over
the world to find a career path that they'll love! On our platform, employees from some of
the world's leading companies host interactive live streams for students and young
professionals. Companies are able to showcase their projects, office and what it's like to
work at the company."
         />
         <ValuesSection
            title="Our core values"
            backgroundColor={white}
            valuesData={valuesData}
         />
         <TeamBiosSection
            backgroundColor={background.default}
            title="Meet our team"
         />
      </UpcomingLayout>
   );
};

export default TeamPage;
