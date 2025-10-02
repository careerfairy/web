import { Box, Typography, Container, Accordion, AccordionSummary, AccordionDetails } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { ChevronDown } from "react-feather"

const styles = sxStyles({
   section: {
      py: { xs: 8, md: 12 },
      backgroundColor: "background.paper"
   },
   titleContainer: {
      textAlign: "center",
      mb: { xs: 6, md: 8 }
   },
   title: {
      mb: 3,
      fontWeight: 700,
      color: "text.primary"
   },
   subtitle: {
      color: "text.secondary",
      maxWidth: "600px",
      mx: "auto"
   },
   accordion: {
      mb: 2,
      borderRadius: "8px !important",
      border: "1px solid",
      borderColor: "grey.200",
      "&:before": {
         display: "none"
      },
      "&.Mui-expanded": {
         borderColor: "primary.main"
      }
   },
   accordionSummary: {
      "& .MuiAccordionSummary-content": {
         my: 2
      }
   },
   questionText: {
      fontWeight: 600,
      color: "text.primary"
   },
   answerText: {
      color: "text.secondary",
      lineHeight: 1.6
   }
})

const faqs = [
   {
      question: "What engineering specializations are represented on CareerFairy?",
      answer: "Our engineering network spans Mechanical, Electrical, Civil, Chemical, Aerospace, Software, Industrial, and Environmental Engineering. We also have professionals from emerging fields like Robotics, AI Engineering, and Sustainable Technology across automotive, aerospace, manufacturing, and tech industries."
   },
   {
      question: "How can engineering professionals help with technical career growth?",
      answer: "Engineering mentors share insights on technical skill development, project management, design thinking, and innovation processes. They can guide you through career paths from individual contributor roles to engineering leadership, R&D, and technical consulting positions."
   },
   {
      question: "What's unique about engineering career progression?",
      answer: "Engineering careers offer dual paths: deep technical specialization or management leadership. Our professionals can help you navigate choices between staying hands-on technical, moving into engineering management, or transitioning to product management and business roles."
   },
   {
      question: "Can I get guidance on engineering certifications and continuing education?",
      answer: "Yes! Our engineering professionals can advise on relevant certifications (PE, PMP, Six Sigma), advanced degrees, and continuous learning strategies. They understand which credentials matter most in different engineering disciplines and career stages."
   },
   {
      question: "How do I prepare for technical interviews and engineering assessments?",
      answer: "Engineering mentors can help you prepare for technical interviews, design challenges, and problem-solving assessments. They'll share frameworks for approaching engineering problems and communicating technical solutions effectively to both technical and non-technical stakeholders."
   }
]

export function FAQSectionEngineering() {
   return (
      <Box sx={styles.section}>
         <Container maxWidth="md">
            <Box sx={styles.titleContainer}>
               <Typography variant="brandedH2" sx={styles.title}>
                  Frequently Asked Questions
               </Typography>
               <Typography variant="brandedBody" sx={styles.subtitle}>
                  Get answers to common questions about engineering careers and how CareerFairy can help advance your technical journey.
               </Typography>
            </Box>
            
            {faqs.map((faq, index) => (
               <Accordion key={index} sx={styles.accordion} elevation={0}>
                  <AccordionSummary
                     expandIcon={<ChevronDown size={20} />}
                     sx={styles.accordionSummary}
                  >
                     <Typography variant="medium" sx={styles.questionText}>
                        {faq.question}
                     </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                     <Typography variant="medium" sx={styles.answerText}>
                        {faq.answer}
                     </Typography>
                  </AccordionDetails>
               </Accordion>
            ))}
         </Container>
      </Box>
   )
}