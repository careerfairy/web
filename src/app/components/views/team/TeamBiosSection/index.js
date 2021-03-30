import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Container} from "@material-ui/core";
import Section from "../common/Section";
import SectionHeader from "../common/SectionHeader";
import TeamBios from "./TeamBios";

const useStyles = makeStyles(theme => ({}));
const people = [
    {
        avatar: "https://media-exp1.licdn.com/dms/image/C4D03AQHmxPB1dAib0w/profile-displayphoto-shrink_200_200/0/1549286027614?e=1622678400&v=beta&t=zG40IN3dJ7qxiwwRT5yAtn1HQ2xRSyTsbRU4FDZ8hV8",
        name: "Thomas Schulz",
        role: "CEO",
        bio:
            "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolorum consequatur numquam aliquam tenetur ad amet inventore hic beatae, quas accusantium perferendis sapiente explicabo.",
        twitterUrl: "",
        linkedinUrl: "https://linkedin.com",
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
            "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolorum consequatur numquam aliquam tenetur ad amet inventore hic beatae, quas accusantium perferendis sapiente explicabo, corporis totam! Labore reprehenderit beatae magnam animi!",
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
    // const [people, setPeople] = React.useState([]);
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
