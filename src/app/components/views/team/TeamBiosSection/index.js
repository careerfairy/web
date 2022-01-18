import React from "react";
import makeStyles from '@mui/styles/makeStyles';
import { Container } from "@mui/material";
import TeamBios from "./TeamBios";
import Section from "../../common/Section";
import SectionHeader from "../../common/SectionHeader";
import { shuffleArray } from "../../../helperFunctions/HelperFunctions";

const useStyles = makeStyles((theme) => ({
   container: {
      zIndex: 1,
      "&.MuiContainer-root": {
         position: "relative",
      },
   },
   title: {
      fontWeight: 500,
   },
}));
const people = [
   {
      id: 1,
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Fthomas.png?alt=media&token=59096526-3f08-45db-843c-d3a46bf4a672",
      name: "Thomas Schulz",
      role: "CEO",
      bio:
         "Thomas obtained his Master’s degree in Mathematics at ETH Zürich. After a few years spent working in Finance between London and Zurich, he fell down the rabbit hole in the world of startups and has been passionate about entrepreneurship ever since.\n\nIn his free time, Thomas enjoys traveling, hiking and reading books.\n",
      twitterUrl: "",
      linkedinUrl: "https://www.linkedin.com/in/thomas-schulz-553301a9/",
   },
   {
      id: 2,
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Fmax.png?alt=media&token=a44fa587-3528-4b26-afb2-a2534efbea24",
      name: "Maximilian Voss",
      role: "CTO",
      bio:
         "After studying physics & aerospace engineering at ETH Zürich, Maximilian had his first startup experience at Entrepreneur First in London, where he fell in love with software development.\nHe is passionate about building up an amazing team of humans at CareerFairy. \n\nIn his free time, he plays the guitar and makes cappuccinos.\n",
      twitterUrl: "",
      linkedinUrl: "https://www.linkedin.com/in/maximilian-voss/",
   },
   {
      id: 3,
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Fhabib.png?alt=media&token=3e63007f-075b-473b-bc29-a16fa624cc66",
      name: "Habib Kadiri",
      role: "Software Engineer",
      bio:
         "With his training as a Full-Stack developer at SIT Academy and with a strong passion for coding, Habib’s knowledgeable understanding of front-end frameworks allows him to design and implement features based on the needs of our ever growing platform. \n\nIn his free time, he likes to workout and help others get in shape.\n",
      linkedinUrl: "https://www.linkedin.com/in/habib-kadiri/",
   },
   {
      id: 4,
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Fsolene.png?alt=media&token=f050377b-1d62-4775-8893-88a059bb9627",
      name: "Solène Wolf",
      role: "Business Development & Strategy",
      bio:
         "Solène owns a Master in Management from Skema Business School in France and started her international path during her exchange semesters in Munich, Germany and Québec, Canada.\nStarting her career in HR Marketing for Alstom in Switzerland made her decide to join Randstad Professionals to deepen her knowledge in recruitment. This experiences were later applied at the Career Center of the Swiss Federal Institute of Technology (ETH Zürich), where she helped students find the right career start. This path naturally lead her to CareerFairy where she enables companies to attract their next generation of talents and realises her purpose: helping students get the insights they need to start their career. \n\nShe loves to spend time with her friends and family, hiking or skiing in the Swiss mountains.\n",
      linkedinUrl: "https://www.linkedin.com/in/solwolff/",
   },
   {
      id: 5,
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Ffabian.png?alt=media&token=24c885e3-36e8-4c53-a95e-f3081a352a1a",
      name: "Fabian Koolstra",
      role: "Sales",
      bio:
         "Fabian obtained his Master’s degree in Accountancy & Control at the University of Amsterdam. After that he joined the Erasmus Student Network in Utrecht and made sure foreign students in Utrecht had a home away from home. Starting his career at Utrecht University where he was a project manager for student and career events. This led to using the CareerFairy platform and subsequently joining the team to expand it throughout Europe.\n\nIn his free time he’s making music, playing music or partying. \n",
      linkedinUrl: "https://www.linkedin.com/in/fabian-koolstra/",
   },
   {
      id: 6,
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2FKandee.jfif?alt=media&token=2906ff55-a50b-4667-a045-f726304e8436",
      name: "Kandeeban Uthayarajah",
      role: "Business Development",
      bio:
         "Kandee holds a bachelor's degree in business administration with a major in general management. He is currently studying for a Master's degree in Business Information Systems. During his education, he has always been passionate about entrepreneurship. Which is why he was also looking for a job in a start-up. As you can see he succeeded, he landed here at CareerFairy as an intern in Business Development.\n\nIn his free time, Kandee loves to party at the weekend after going running or to the gym several times during the week. He also likes to travel around the world and read books.\n",
      linkedinUrl:
         "https://www.linkedin.com/in/kandeeban-uthayarajah-850a541b4/",
   },
   {
      id: 7,
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2FRamona.jfif?alt=media&token=11cc6d3b-dfed-49f3-9dc6-511d270936a8",
      name: "Ramona Neff",
      role: "Marketing",
      bio:
         "Ramona has a bachelor’s degree in Business Administration and majored in Digital Marketing. After her graduation, Ramona wanted to start working in a company with a hands-on culture. She believes that she can learn so much more about marketing. This led her to CareerFairy as an intern in a fast growing start-up. \n\nRamona is a blue belt in Brazilian Jiu-Jitsu, loves to hike, cook, and travel around the world.\n",
      linkedinUrl: "https://www.linkedin.com/in/ramona-neff/",
   },
   {
      id: 8,
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2FMikhail.jfif?alt=media&token=68926cde-2e93-4262-8915-9a308d18acf2",
      name: "Mikhail Asryan",
      role: "Business Development",
      bio:
         "Mikhail holds a BBA degree from IUG and University of Plymouth. He is currently doing his finance analytics masters at King’s College London. He is passionate about entrepreneurship, startups and communication with people. At CareerFairy, Mikhail is your go-to person for partnerships and business development. \n\nIn his free time he enjoys spending time with his family, dancing (disco-fox, walzer), listening to audiobooks (biographies), listening to russian rap (don’t judge him), cooking, but most importantly - petting his cat!\n",
      linkedinUrl: "https://www.linkedin.com/in/mikhail-asryan-a67915160/",
   },
   {
      id: 9,
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2FGary.jfif?alt=media&token=bf7b86a0-e9a7-4212-9a2e-a5c0800d74c8",
      name: "Gary Terol",
      role: "Business Development & Strategy",
      bio: "",
      linkedinUrl: "https://www.linkedin.com/in/gary-terol/",
   },
];

const shuffledPeople = shuffleArray(people);

const TeamBiosSection = (props) => {
   const classes = useStyles();
   return (
      <Section
         color={props.color}
         backgroundImage={props.backgroundImage}
         backgroundImageOpacity={props.backgroundImageOpacity}
         backgroundColor={props.backgroundColor}
      >
         <Container className={classes.container}>
            <SectionHeader
               title={props.title}
               subtitle={props.subtitle}
               titleClassName={classes.title}
               color={props.color}
               size={3}
               spaced={true}
               className="has-text-centered"
            />
            <TeamBios people={shuffledPeople} />
         </Container>
      </Section>
   );
};

export default TeamBiosSection;
