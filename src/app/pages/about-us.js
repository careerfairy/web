import React from "react";
import HeroSection from "../components/views/aboutUs/HeroSection";
import TeamBiosSection from "../components/views/aboutUs/TeamBiosSection";
import { useTheme } from "@mui/material/styles";
import UpcomingLayout from "../layouts/UpcomingLayout";
import ValuesSection from "../components/views/aboutUs/ValuesSection";
import { honestyShape, ideaShape, qualityShape } from "../constants/images";

const teamPhoto =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Fgroup-photo-cropped.jpg?alt=media&token=35319d7b-38a0-474f-935f-4f5890c37717";
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
            "Live Stream quality for both \n" +
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
            backgroundImagePosition="center center"
            backgroundImage={teamPhoto}
            backgroundImageOpacity={0.2}
            title="About Us"
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
