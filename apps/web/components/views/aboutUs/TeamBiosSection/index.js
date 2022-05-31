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
      id: 1,
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Fthomas.jpg?alt=media&token=0edea68e-b08e-40fe-a33a-fd48657a5865",
      name: "Thomas Schulz",
      role: "CEO",
      bio: "Thomas obtained his Master’s degree in Mathematics at ETH Zürich. After a few years spent working in Finance between London and Zurich, he fell down the rabbit hole in the world of startups and has been passionate about entrepreneurship ever since.\n\nIn his free time, Thomas enjoys traveling, hiking and reading books.\n",
      twitterUrl: "",
      linkedinUrl: "https://www.linkedin.com/in/thomas-schulz-553301a9/",
   },
   {
      id: 2,
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Fmax.jpg?alt=media&token=0ec96792-9c2d-4741-9f73-75c668a78153",
      name: "Maximilian Voss",
      role: "CTO",
      bio: "After studying physics & aerospace engineering at ETH Zürich, Maximilian had his first startup experience at Entrepreneur First in London, where he fell in love with software development.\nHe is passionate about building up an amazing team of humans at CareerFairy. \n\nIn his free time, he plays the guitar and makes cappuccinos.\n",
      twitterUrl: "",
      linkedinUrl: "https://www.linkedin.com/in/maximilian-voss/",
   },
   {
      id: 3,
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Fhabib.jpg?alt=media&token=572dadf8-2e04-4da8-81d2-08f6060cdca8",
      name: "Habib Kadiri",
      role: "Software Engineer",
      bio: "With his training as a Full-Stack developer at SIT Academy and with a strong passion for coding, Habib’s knowledgeable understanding of front-end frameworks allows him to design and implement features based on the needs of our ever growing platform. \n\nIn his free time, he likes to workout and help others get in shape.\n",
      linkedinUrl: "https://www.linkedin.com/in/habib-kadiri/",
   },
   // {
   //    id: 4,
   //    avatar:
   //       "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Fsolene.png?alt=media&token=f050377b-1d62-4775-8893-88a059bb9627",
   //    name: "Solène Wolf",
   //    role: "Business Development & Strategy",
   //    bio:
   //       "Solène owns a Master in Management from Skema Business School in France and started her international path during her exchange semesters in Munich, Germany and Québec, Canada.\nStarting her career in HR Marketing for Alstom in Switzerland made her decide to join Randstad Professionals to deepen her knowledge in recruitment. This experiences were later applied at the Career Center of the Swiss Federal Institute of Technology (ETH Zürich), where she helped students find the right career start. This path naturally lead her to CareerFairy where she enables companies to attract their next generation of talents and realises her purpose: helping students get the insights they need to start their career. \n\nShe loves to spend time with her friends and family, hiking or skiing in the Swiss mountains.\n",
   //    linkedinUrl: "https://www.linkedin.com/in/solwolff/",
   // },
   {
      id: 5,
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Ffabian.jpg?alt=media&token=77bab994-e8b9-4894-ae18-c2442c4c3ced",
      name: "Fabian Koolstra",
      role: "Sales",
      bio: "Fabian obtained his Master’s degree in Accountancy & Control at the University of Amsterdam. After that he joined the Erasmus Student Network in Utrecht and made sure foreign students in Utrecht had a home away from home. Starting his career at Utrecht University where he was a project manager for student and career events. This led to using the CareerFairy platform and subsequently joining the team to expand it throughout Europe.\n\nIn his free time he’s making music, playing music or partying. \n",
      linkedinUrl: "https://www.linkedin.com/in/fabian-koolstra/",
   },
   {
      id: 6,
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Fkandee.jpg?alt=media&token=c2424e74-a6b5-4ffc-b9e8-6d3344960984",
      name: "Kandeeban Uthayarajah",
      role: "Business Development",
      bio: "Kandee holds a bachelor's degree in business administration with a major in general management. He is currently studying for a Master's degree in Business Information Systems. During his education, he has always been passionate about entrepreneurship. Which is why he was also looking for a job in a start-up. As you can see he succeeded, he landed here at CareerFairy as an intern in Business Development.\n\nIn his free time, Kandee loves to party at the weekend after going running or to the gym several times during the week. He also likes to travel around the world and read books.\n",
      linkedinUrl:
         "https://www.linkedin.com/in/kandeeban-uthayarajah-850a541b4/",
   },
   {
      id: 7,
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Framona.jpg?alt=media&token=49030c21-a7ad-4bae-8a1a-e027234e9215",
      name: "Ramona Neff",
      role: "Marketing",
      bio: "Ramona has a bachelor’s degree in Business Administration and majored in Digital Marketing. After her graduation, Ramona wanted to start working in a company with a hands-on culture. She believes that she can learn so much more about marketing. This led her to CareerFairy as an intern in a fast growing start-up. \n\nRamona is a blue belt in Brazilian Jiu-Jitsu, loves to hike, cook, and travel around the world.\n",
      linkedinUrl: "https://www.linkedin.com/in/ramona-neff/",
   },
   {
      id: 8,
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Fmikhail.jpg?alt=media&token=36f7ebfa-e4b0-4b37-a546-973d5c2b9aaa",
      name: "Mikhail Asryan",
      role: "Business Development",
      bio: "Mikhail holds a BBA degree from IUG and University of Plymouth. He is currently doing his finance analytics masters at King’s College London. He is passionate about entrepreneurship, startups and communication with people. At CareerFairy, Mikhail is your go-to person for partnerships and business development. \n\nIn his free time he enjoys spending time with his family, dancing (disco-fox, walzer), listening to audiobooks (biographies), listening to russian rap (don’t judge him), cooking, but most importantly - petting his cat!\n",
      linkedinUrl: "https://www.linkedin.com/in/mikhail-asryan-a67915160/",
   },
   {
      id: 9,
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
      id: 10,
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Fcarlos.jpg?alt=media&token=be83b56c-a848-4028-8a2f-a1a293a80c62",
      name: "Carlos Florêncio",
      role: "Software Engineer",
      bio:
         "Carlos has a background in Computer Science and a very diversified skill set. The experience of working as an SRE, Manager and Backend Developer has given him a different perspective when approaching problems.\n" +
         "\n" +
         "In his free time, he's developing side projects and spending time with friends.\n",
      linkedinUrl: "https://www.linkedin.com/in/carlosflorencio/",
   },
   {
      id: 11,
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Flinda.jpg?alt=media&token=c8585b38-ca90-4093-9f28-eb37d485d8ed",
      name: "Linda Fairgrieve",
      role: "B2B Content Marketing",
      bio:
         "After obtaining the Swiss Federal Marketing Diploma as a generalist, Linda gained her digital marketing scars on the front lines of Swiss Digital Agencies. Passionate about B2B sector and communication, she never stops learning and has found that Content Management for startup growth is her playground of choice.\n\n" +
         "When she is not reading marketing blogs or testing new martech tools, she makes memories in the company of her colourful ‘family of friends’ discovering new wine varieties.",
      linkedinUrl: "https://www.linkedin.com/in/lindafairgrieve/",
   },
   {
      id: 12,
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2Fzippy.jpg?alt=media&token=e7221990-e3fe-4453-9fc8-f4377251e448",
      name: "Zarbab Aamir",
      role: "Marketing Intern",
      bio:
         "Zarbab (but call her Zippy) has recently graduated with a bachelor’s in International Business Management with a major in Digital Marketing. Zippy joined the team as a marketing intern to gain further skills and knowledge in the field of marketing. She believes this experience will give her the right skill-set when moving forward with her career. \n" +
         "\n" +
         "In her free-time she loves to DJ, listen to lots of music, read and spend time with her friends.\n",
      linkedinUrl: "https://www.linkedin.com/in/zarbab-aamir-601065b1/",
   },
   {
      id: 13,
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2FHugo.jpg?alt=media&token=b0a67b4f-ec54-45d8-92a3-64c17ad216c5",
      name: "Hugo Lammers",
      role: "Business Development & Finance",
      bio:
         "After a few years in a financial consulting role at a Big4 firm, Hugo joined a Dutch scale-up as Business Development Manager.\n" +
         "He now likes to apply both his finance and BD experience in the fast-growth environment at CareerFairy.\n" +
         "Hugo holds a Bachelor's in Industrial Engineering from the Rijksuniversiteit Groningen and a Master's in Finance from the VU Amsterdam.\n\n" +
         "In his free time, Hugo loves to ski, play chess and hit the gym!",
      linkedinUrl: "https://www.linkedin.com/in/hugo-lammers-57730920/",
   },
   {
      id: 14,
      avatar:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/team-pics%2FLina.jpg?alt=media&token=2ae6cfc0-3c95-4e92-a3c2-2bbe3e2edad9",
      name: "Carolina Gentsch",
      role: "Business Development",
      bio:
         "Carolina holds a M.Sc. in Human Resource Management, with a background in Applied Business Languages and International Management. While studying and working in Japan, China and the USA, she fostered her passion for working and interacting with people rather than solely with numbers. This led her to join the CareerFairy team as a Business Development Manager, where she combines her people skills with her management background. \n" +
         "\n" +
         "In her free time she loves to play the guitar, recently started snowboarding and has this unique hobby called LARP: google will help you to learn more about it ;)",
      linkedinUrl: "https://www.linkedin.com/in/carolina-gentsch-hrm/",
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
