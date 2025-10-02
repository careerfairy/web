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
      question: "What FMCG career paths can I explore through CareerFairy?",
      answer: "Our FMCG network covers diverse roles including Brand Management, Product Development, Marketing, Sales, Supply Chain, Category Management, Trade Marketing, and Consumer Insights. Whether you're interested in working for global giants like Unilever and P&G or emerging consumer brands, our professionals can guide you."
   },
   {
      question: "How do FMCG professionals help with career transitions?",
      answer: "FMCG professionals on our platform share insights about industry trends, consumer behavior analysis, brand positioning strategies, and market dynamics. They can help you understand the fast-paced nature of consumer goods and prepare for roles that require quick decision-making and market responsiveness."
   },
   {
      question: "What makes FMCG careers unique compared to other industries?",
      answer: "FMCG careers offer rapid career progression, exposure to consumer psychology, hands-on experience with product launches, and the opportunity to work with brands that millions of people use daily. The industry values innovation, speed-to-market, and data-driven decision making."
   },
   {
      question: "Can I get guidance on FMCG internships and graduate programs?",
      answer: "Absolutely! Many of our FMCG professionals have gone through prestigious graduate programs at companies like P&G, Unilever, and Nestlé. They can provide insights into application processes, assessment centers, and what these companies look for in candidates."
   },
   {
      question: "How do I prepare for FMCG interviews and case studies?",
      answer: "Our FMCG mentors can help you prepare for typical FMCG interview formats including brand case studies, market sizing questions, and consumer insight challenges. They'll share frameworks for thinking about brand problems and consumer behavior analysis."
   }
]

export function FAQSectionFMCG() {
   return (
      <Box sx={styles.section}>
         <Container maxWidth="md">
            <Box sx={styles.titleContainer}>
               <Typography variant="brandedH2" sx={styles.title}>
                  Frequently Asked Questions
               </Typography>
               <Typography variant="brandedBody" sx={styles.subtitle}>
                  Get answers to common questions about FMCG careers and how CareerFairy can help accelerate your journey in consumer goods.
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