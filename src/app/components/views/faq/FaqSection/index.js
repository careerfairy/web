import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Section from "../../common/Section";
import SectionHeader from "../../common/SectionHeader";
import Faq from "./Faq";
import SupportContainer from "../../support/SupportContainer";

const useStyles = makeStyles(theme => ({}));

const FaqSection = (props) => {

    const classes = useStyles()

    return (
        <Section
            big
            color={props.color}
            backgroundImage={props.backgroundImage}
            backgroundImageOpacity={props.backgroundImageOpacity}
            backgroundColor={props.backgroundColor}
        >
            <SupportContainer>
                <SectionHeader
                    color={props.color}
                    title={props.title}
                    subtitle={props.subtitle}
                />
                <Faq
                    items={[
                        {
                            question: "Integer ornare neque mauris?",
                            answer: "Integer ornare neque mauris, ac vulputate lacus venenatis et. Pellentesque ut ultrices purus. " +
                                "Suspendisse ut tincidunt eros. In velit mi, rhoncus dictum neque a, tincidunt lobortis justo.",
                            href: "question1"
                        },
                        {
                            question: "Lorem ipsum dolor sit amet?",
                            answer:
                                "Nunc nulla mauris, laoreet vel cursus lacinia, consectetur sit amet tellus. Suspendisse ut " +
                                "tincidunt eros. In velit mi, rhoncus dictum neque a, tincidunt lobortis justo.",
                            href: "question2"
                        },
                        {
                            question: "Suspendisse ut tincidunt?",
                            answer:
                                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In lobortis, metus et mattis ullamcorper. " +
                                "Suspendisse ut tincidunt eros. In velit mi, rhoncus dictum neque a, tincidunt lobortis justo.",
                            href: "question3"
                        },
                        {
                            question: "Ut enim ad minim veniam?",
                            answer:
                                "Suspendisse ut tincidunt eros. In velit mi, rhoncus dictum neque a, tincidunt lobortis justo.",
                            href: "question4"
                        },
                        {
                            question: "In velit mi, rhoncus dictum neque?",
                            answer:
                                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut " +
                                "labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.",
                            href: "question5"
                        },
                        {
                            question: "In velit mi, rhoncus dictum neque?",
                            answer:
                                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut " +
                                "labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.",
                            href: "question6"
                        },
                        {
                            question: "In velit mi, rhoncus dictum neque?",
                            answer:
                                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut " +
                                "labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.",
                            href: "question7"
                        },
                        {
                            question: "In velit mi, rhoncus dictum neque?",
                            answer:
                                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut " +
                                "labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.",
                            href: "question8"
                        },
                        {
                            question: "In velit mi, rhoncus dictum neque?",
                            answer:
                                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut " +
                                "labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.",
                            href: "question9"
                        },
                        {
                            question: "In velit mi, rhoncus dictum neque?",
                            answer:
                                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut " +
                                "labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.",
                            href: "question10"
                        },
                        {
                            question: "In velit mi, rhoncus dictum neque?",
                            answer:
                                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut " +
                                "labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.",
                            href: "question11"
                        },
                        {
                            question: "In velit mi, rhoncus dictum neque?",
                            answer:
                                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut " +
                                "labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.",
                            href: "question12"
                        },
                        {
                            question: "In velit mi, rhoncus dictum neque?",
                            answer:
                                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut " +
                                "labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.",
                            href: "question13"
                        },
                        {
                            question: "In velit mi, rhoncus dictum neque?",
                            answer:
                                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut " +
                                "labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.",
                            href: "question14"
                        },
                        {
                            question: "In velit mi, rhoncus dictum neque?",
                            answer:
                                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut " +
                                "labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.",
                            href: "question15"
                        },
                    ]}
                />
            </SupportContainer>
        </Section>
    );
};

export default FaqSection;
