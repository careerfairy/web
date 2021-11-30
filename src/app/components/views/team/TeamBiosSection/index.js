import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Container } from "@material-ui/core";
import TeamBios from "./TeamBios";
import Section from "../../common/Section";
import SectionHeader from "../../common/SectionHeader";

const useStyles = makeStyles((theme) => ({}));
const people = [
  {
    avatar:
      "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Fthomas.png?alt=media&token=59096526-3f08-45db-843c-d3a46bf4a672",
    name: "Thomas Schulz",
    role: "CEO",
    bio:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolorum consequatur numquam aliquam tenetur ad amet inventore hic beatae, quas accusantium perferendis sapiente explicabo.",
    twitterUrl: "",
    linkedinUrl: "https://www.linkedin.com/in/thomas-schulz-553301a9/",
  },
  {
    avatar:
      "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Fmax.png?alt=media&token=a44fa587-3528-4b26-afb2-a2534efbea24",
    name: "Maximilian Voss",
    role: "CTO",
    bio:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolorum consequatur numquam aliquam tenetur ad amet inventore hic beatae, quas accusantium perferendis sapiente explicabo, corporis totam! Labore reprehenderit beatae magnam animi!",
    twitterUrl: "",
    linkedinUrl: "https://www.linkedin.com/in/maximilian-voss/",
  },
  {
    avatar:
      "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Fsolene.png?alt=media&token=f050377b-1d62-4775-8893-88a059bb9627",
    name: "Solène Wolf",
    role: "Business Development & Strategy",
    bio:
      "Solène owns a Master in Management from Skema Business School in France and started her international path during her exchange semesters in Munich, Germany and Québec, Canada.\\n" +
      "Starting her career in HR Marketing for Alstom in Switzerland made her decide to join Randstad Professionals to deepen her knowledge in recruitment. This experiences were later applied at " +
      "the Career Center of the Swiss Federal Institute of Technology (ETH Zürich), where she helped students find the right career start. This path naturally lead her to CareerFairy where she " +
      "enables companies to attract their next generation of talents and realises her purpose: helping students get the insights they need to start their career.\\n" +
      "She loves to spend time with her friends and family, hiking or skiing in the Swiss mountains.",
    twitterUrl: "",
    linkedinUrl: "https://www.linkedin.com/in/solwolff/",
  },
  {
    avatar:
      "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Fhabib.png?alt=media&token=3e63007f-075b-473b-bc29-a16fa624cc66",
    name: "Habib Kadiri",
    role: "Software Developer",
    bio:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolorum consequatur numquam aliquam tenetur ad amet inventore hic beatae, quas accusantium perferendis sapiente explicabo, corporis totam! Labore reprehenderit beatae magnam animi!",
    twitterUrl: "",
    linkedinUrl: "https://www.linkedin.com/in/habib-kadiri/",
  },
  {
    avatar:
      "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Ffabian.png?alt=media&token=24c885e3-36e8-4c53-a95e-f3081a352a1a",
    name: "Fabian Koolstra",
    role: "Sales",
    bio:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolorum consequatur numquam aliquam tenetur ad amet inventore hic beatae, quas accusantium perferendis sapiente explicabo, corporis totam! Labore reprehenderit beatae magnam animi!",
    twitterUrl: "",
    linkedinUrl: "https://www.linkedin.com/in/fabian-koolstra/",
  },
];
const TeamBiosSection = (props) => {
  const classes = useStyles();

  return (
    <Section
      color={props.color}
      backgroundImage={props.backgroundImage}
      backgroundImageOpacity={props.backgroundImageOpacity}
    >
      <Container>
        <SectionHeader
          title={props.title}
          subtitle={props.subtitle}
          color={props.color}
          size={3}
          spaced={true}
          className="has-text-centered"
        />
        <TeamBios people={people} />
      </Container>
    </Section>
  );
};

export default TeamBiosSection;
