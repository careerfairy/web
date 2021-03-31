import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Container} from "@material-ui/core";
import TeamBios from "./TeamBios";
import Section from "../../common/Section";
import SectionHeader from "../../common/SectionHeader";

const useStyles = makeStyles(theme => ({}));
const people = [
    {
        avatar: "https://media-exp1.licdn.com/dms/image/C4D03AQHmxPB1dAib0w/profile-displayphoto-shrink_200_200/0/1549286027614?e=1622678400&v=beta&t=zG40IN3dJ7qxiwwRT5yAtn1HQ2xRSyTsbRU4FDZ8hV8",
        name: "Thomas Schulz",
        role: "CEO",
        bio:
            "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolorum consequatur numquam aliquam tenetur ad amet inventore hic beatae, quas accusantium perferendis sapiente explicabo.",
        twitterUrl: "",
        linkedinUrl: "https://www.linkedin.com/in/thomas-schulz-553301a9/",
    },
    {
        avatar: "https://media-exp1.licdn.com/dms/image/C4D03AQEpVEBu4cq9nA/profile-displayphoto-shrink_200_200/0/1578944108740?e=1622678400&v=beta&t=8nBUaTRFxUwT8lShOKGjQ6bCNZkKILO_QGWMezHRu_I",
        name: "Maximilian Voss",
        role: "CTO",
        bio:
            "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolorum consequatur numquam aliquam tenetur ad amet inventore hic beatae, quas accusantium perferendis sapiente explicabo, corporis totam! Labore reprehenderit beatae magnam animi!",
        twitterUrl: "",
        linkedinUrl: "https://www.linkedin.com/in/maximilian-voss/",
    },
    {
        avatar: "https://media-exp1.licdn.com/dms/image/C5103AQExQqthbJwyrA/profile-displayphoto-shrink_200_200/0/1516732151596?e=1622678400&v=beta&t=ozYwK0Ks1FaegWvY1dhHqkcD3TeZWB8lasn7OW4DQxg",
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
        avatar: "https://media-exp1.licdn.com/dms/image/C4D03AQH1_K5kGSqzMQ/profile-displayphoto-shrink_200_200/0/1580646172143?e=1622678400&v=beta&t=bcZ6DYIBZ5F0ID_edNHellyNg_klLsZ2A-sG3XJs_9k",
        name: "Habib Kadiri",
        role: "Software Developer",
        bio:
            "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolorum consequatur numquam aliquam tenetur ad amet inventore hic beatae, quas accusantium perferendis sapiente explicabo, corporis totam! Labore reprehenderit beatae magnam animi!",
        twitterUrl: "",
        linkedinUrl: "https://www.linkedin.com/in/habib-kadiri/",
    },
    {
        avatar: "https://media-exp1.licdn.com/dms/image/C5603AQGb5TLg2ABtNw/profile-displayphoto-shrink_200_200/0/1551098619566?e=1622678400&v=beta&t=lE4k4Nd725J19ImnFphR8iXt47eCTyFqWFdSvKs9Xog",
        name: "Fabian Koolstra",
        role: "Sales",
        bio:
            "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolorum consequatur numquam aliquam tenetur ad amet inventore hic beatae, quas accusantium perferendis sapiente explicabo, corporis totam! Labore reprehenderit beatae magnam animi!",
        twitterUrl: "",
        linkedinUrl: "https://www.linkedin.com/in/fabian-koolstra/",
    },
]
const TeamBiosSection = (props) => {
    const classes = useStyles()

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
                <TeamBios
                    people={people}
                />
            </Container>
        </Section>
    );
};

export default TeamBiosSection;
