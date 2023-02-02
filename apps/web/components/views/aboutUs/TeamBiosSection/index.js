import React from "react"
import { Container } from "@mui/material"
import TeamBios from "./TeamBios"
import Section from "../../common/Section"
import SectionHeader from "../../common/SectionHeader"
import { shuffleArray } from "../../../helperFunctions/HelperFunctions"

const styles = {
   container: {
      zIndex: 1,
      "&.MuiContainer-root": {
         position: "relative",
      },
   },
   title: {
      fontWeight: 500,
   },
}
const people = [
   {
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Fthomas.jpg?alt=media&token=0edea68e-b08e-40fe-a33a-fd48657a5865",
      name: "Thomas Schulz",
      role: "CEO",
      bio: "Thomas obtained his Master’s degree in Mathematics at ETH Zürich. After a few years spent working in Finance between London and Zurich, he fell down the rabbit hole in the world of startups and has been passionate about entrepreneurship ever since.\n\nIn his free time, Thomas enjoys traveling, hiking and reading books.\n",
      twitterUrl: "",
      linkedinUrl: "https://www.linkedin.com/in/thomas-schulz-553301a9/",
   },
   {
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Fmax.jpg?alt=media&token=0ec96792-9c2d-4741-9f73-75c668a78153",
      name: "Maximilian Voss",
      role: "CTO",
      bio: "After studying physics & aerospace engineering at ETH Zürich, Maximilian had his first startup experience at Entrepreneur First in London, where he fell in love with software development.\nHe is passionate about building up an amazing team of humans at CareerFairy. \n\nIn his free time, he plays the guitar and makes cappuccinos.\n",
      twitterUrl: "",
      linkedinUrl: "https://www.linkedin.com/in/maximilian-voss/",
   },
   {
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Fhabib.jpg?alt=media&token=572dadf8-2e04-4da8-81d2-08f6060cdca8",
      name: "Habib Kadiri",
      role: "Software Engineer",
      bio: "With his training as a Full-Stack developer at SIT Academy and with a strong passion for coding, Habib’s knowledgeable understanding of front-end frameworks allows him to design and implement features based on the needs of our ever growing platform. \n\nIn his free time, he likes to workout and help others get in shape.\n",
      linkedinUrl: "https://www.linkedin.com/in/habib-kadiri/",
   },
   {
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Ffabian.jpg?alt=media&token=77bab994-e8b9-4894-ae18-c2442c4c3ced",
      name: "Fabian Koolstra",
      role: "Business Development UK",
      bio: "Fabian obtained his Master’s degree in Accountancy & Control at the University of Amsterdam. After that he joined the Erasmus Student Network in Utrecht and made sure foreign students in Utrecht had a home away from home. Starting his career at Utrecht University where he was a project manager for student and career events. This led to using the CareerFairy platform and subsequently joining the team to expand it throughout Europe.\n\nIn his free time he’s making music, playing music or partying. \n",
      linkedinUrl: "https://www.linkedin.com/in/fabian-koolstra/",
   },
   {
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Fkandee.jpg?alt=media&token=c2424e74-a6b5-4ffc-b9e8-6d3344960984",
      name: "Kandeeban Uthayarajah",
      role: "Business Development CH",
      bio: "Kandee holds a bachelor's degree in business administration with a major in general management. He is currently studying for a Master's degree in Business Information Systems. During his education, he has always been passionate about entrepreneurship. Which is why he was also looking for a job in a start-up. As you can see he succeeded, he landed here at CareerFairy as an intern in Business Development.\n\nIn his free time, Kandee loves to party at the weekend after going running or to the gym several times during the week. He also likes to travel around the world and read books.\n",
      linkedinUrl:
         "https://www.linkedin.com/in/kandeeban-uthayarajah-850a541b4/",
   },
   {
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Framona.jpg?alt=media&token=49030c21-a7ad-4bae-8a1a-e027234e9215",
      name: "Ramona Neff",
      role: "Marketing",
      bio: "Ramona has a bachelor’s degree in Business Administration and majored in Digital Marketing. After her graduation, Ramona wanted to start working in a company with a hands-on culture. She believes that she can learn so much more about marketing. This led her to CareerFairy as an intern in a fast growing start-up. \n\nRamona is a blue belt in Brazilian Jiu-Jitsu, loves to hike, cook, and travel around the world.\n",
      linkedinUrl: "https://www.linkedin.com/in/ramona-neff/",
   },
   {
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2FLisa.jpg?alt=media&token=e95898ed-fa21-42a4-9874-443b331f4de8",
      name: "Lisa Brandenberger",
      role: "Talent Growth Manager",
      bio:
         "Lisa is about to finish her Bachelor’s degree in Applied Linguistics at ZHAW. Her passion for languages has led her to gain a toehold in an international start up. Besides work, she loves spending time with her family and friends or pursuing her interests in photography, social media and fashion trends.\n" +
         "In addition to her commitment to ESN Winterthur, Lisa also tries to keep up to date with the latest political developments.\n",
      linkedinUrl: "https://www.linkedin.com/in/lisa-brandenberger-000707236/",
   },
   {
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Fgary.jpg?alt=media&token=c5893021-c141-43af-89cc-b3d440cbad78",
      name: "Gary Terol",
      role: "Business Development",
      bio:
         "Gary is a serial entrepreneur who cannot be inactive for more than 2 minutes. He likes to challenge established ways of thinking and believes everybody he speaks with can teach him something. \n" +
         "\n" +
         "After graduating from the University of St.Gallen and completing two exchange semesters in Medellin (COL) and, respectively, Cologne (GER), he entered the world of entrepreneurship.",
      linkedinUrl: "https://www.linkedin.com/in/gary-terol/",
   },
   {
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Fcarlos.jpg?alt=media&token=f10c6234-f719-4cef-8b39-cd15f279f0ff",
      name: "Carlos Florêncio",
      role: "Software Engineer",
      bio:
         "Carlos has a background in Computer Science and a very diversified skill set. The experience of working as an SRE, Manager and Backend Developer has given him a different perspective when approaching problems.\n" +
         "\n" +
         "In his free time, he's developing side projects and spending time with friends.\n",
      linkedinUrl: "https://www.linkedin.com/in/carlosflorencio/",
   },
   {
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Flinda.jpg?alt=media&token=c8585b38-ca90-4093-9f28-eb37d485d8ed",
      name: "Linda Fairgrieve",
      role: "Head of Marketing",
      bio:
         "After obtaining the Swiss Federal Marketing Diploma as a generalist, Linda gained her digital marketing scars on the front lines of Swiss Digital Agencies. Passionate about B2B sector and communication, she never stops learning and has found that Content Management for startup growth is her playground of choice.\n\n" +
         "When she is not reading marketing blogs or testing new martech tools, she makes memories in the company of her colourful ‘family of friends’ discovering new wine varieties.",
      linkedinUrl: "https://www.linkedin.com/in/lindafairgrieve/",
   },
   {
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2FBruno.jpg?alt=media&token=70a7c99f-d9f7-4d75-8b6b-c9a3d6eaa0a2",
      name: "Bruno Flütsch",
      role: "Marketing and Localisation Manager",
      bio:
         "After completing his bachelor's degree in business administration from the University of St. Gallen (HSG), Bruno worked in both partner management and direct sales development at a European leader in meeting management software. Afterwards, Bruno joined CareerFairy as a Marketing Manager and is passionate about students finding the career path they will love!\n" +
         "\n" +
         "In his free time, he enjoys sports and music.",
      linkedinUrl: "https://www.linkedin.com/in/bruno-fl%C3%BCtsch/",
   },
   {
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Fzippy.jpg?alt=media&token=e7221990-e3fe-4453-9fc8-f4377251e448",
      name: "Zarbab Aamir",
      role: "Digital Marketing & Social Media",
      bio:
         "Zarbab (but call her Zippy) has recently graduated with a bachelor’s in International Business Management with a major in Digital Marketing. Zippy joined the team as a marketing intern to gain further skills and knowledge in the field of marketing. She believes this experience will give her the right skill-set when moving forward with her career. \n" +
         "\n" +
         "In her free-time she loves to DJ, listen to lots of music, read and spend time with her friends.\n",
      linkedinUrl: "https://www.linkedin.com/in/zarbab-aamir-601065b1/",
   },
   {
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2FHugo.jpg?alt=media&token=b0a67b4f-ec54-45d8-92a3-64c17ad216c5",
      name: "Hugo Lammers",
      role: "Business Development NL & Finance",
      bio:
         "After a few years in a financial consulting role at a Big4 firm, Hugo joined a Dutch scale-up as Business Development Manager.\n" +
         "He now likes to apply both his finance and BD experience in the fast-growth environment at CareerFairy.\n" +
         "Hugo holds a Bachelor's in Industrial Engineering from the Rijksuniversiteit Groningen and a Master's in Finance from the VU Amsterdam.\n\n" +
         "In his free time, Hugo loves to ski, play chess and hit the gym!",
      linkedinUrl: "https://www.linkedin.com/in/hugo-lammers-57730920/",
   },
   {
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2FLina.jpg?alt=media&token=2ae6cfc0-3c95-4e92-a3c2-2bbe3e2edad9",
      name: "Carolina Gentsch",
      role: "Business Development DE",
      bio:
         "Carolina holds a M.Sc. in Human Resource Management, with a background in Applied Business Languages and International Management. While studying and working in Japan, China and the USA, she fostered her passion for working and interacting with people rather than solely with numbers. This led her to join the CareerFairy team as a Business Development Manager, where she combines her people skills with her management background. \n" +
         "\n" +
         "In her free time she loves to play the guitar, recently started snowboarding and has this unique hobby called LARP: google will help you to learn more about it ;)",
      linkedinUrl: "https://www.linkedin.com/in/carolina-gentsch-hrm/",
   },
   {
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2FGonc%CC%A7alo.jpg?alt=media&token=36e33bae-ab55-493e-8c15-6e6f68594f88",
      name: "Gonçalo Santos",
      role: "Software Engineer",
      bio:
         "Gonçalo is a Portuguese Computer Science Engineer who was involved in several projects as a front-end developer, focused on web and mobile applications.\n" +
         "\n" +
         "In his free time he likes to surf and travel",
      linkedinUrl: "https://www.linkedin.com/in/gon%C3%A7alothsantos/",
   },
   {
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2FSimone2.jpg?alt=media&token=7aad8889-afc5-40c4-be02-065e95ae1ec1",
      name: "Simone Angeloni",
      role: "Product Manager",
      bio:
         "Simone holds a Master’s degree in Mathematics from ETH Zürich. After 4 years at Big4  consulting company working as a Digital Experience & Innovation consultant, he decided to take a big leap and join a start-up. \n" +
         "In his free time he likes to travel and has been to all ASEAN countries. His passion is to discover new music - yes he flew half a continent just for a concert (twice!).\n" +
         "\n" +
         "At CareerFairy he is our Product Manager focussing on the growth of our platform.",
      linkedinUrl: "https://www.linkedin.com/in/sangeloni/",
   },
   {
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2FDaniel.jpg?alt=media&token=b1747e73-8ffc-4526-b453-fe2f473db42b",
      name: "Daniel Butt",
      role: "Marketing Manager",
      bio:
         "The latest addition to the German Market Team and the sunburst of energy that is coming the German market's way -\n" +
         'Daniel has a Master\'s degree in "something with media", blogged about feminist erotica, dabbled briefly in revolutionising the energy industry, spent lots of time recruiting young talent for NGOs (we adore this bit), growing B2B markets and, as a proper German linguistic enthusiast, loves run-on-sentences.\n' +
         "At CareerFairy he will put his skills into action by growing our business in Germany, so his lifelong dream of becoming Pirate King will just have to wait a tad longer.",
      linkedinUrl: "https://www.linkedin.com/in/daniel-butt-8b138314b/",
   },
]

const shuffledPeople = shuffleArray(people)

const TeamBiosSection = (props) => {
   return (
      <Section
         color={props.color}
         backgroundImage={props.backgroundImage}
         backgroundImageOpacity={props.backgroundImageOpacity}
         backgroundColor={props.backgroundColor}
      >
         <Container sx={styles.container}>
            <SectionHeader
               title={props.title}
               subtitle={props.subtitle}
               titleSx={styles.title}
               color={props.color}
               size={3}
               spaced={true}
               className="has-text-centered"
            />
            <TeamBios people={shuffledPeople} />
         </Container>
      </Section>
   )
}

export default TeamBiosSection
