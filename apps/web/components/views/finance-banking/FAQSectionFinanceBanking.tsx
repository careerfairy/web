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
      question: "What finance and banking roles can I explore through CareerFairy?",
      answer: "Our finance network covers Investment Banking, Corporate Finance, Private Equity, Hedge Funds, Asset Management, Risk Management, Financial Planning & Analysis, Treasury, Commercial Banking, and Fintech. We connect you with professionals from bulge bracket banks, boutique firms, and innovative fintech companies."
   },
   {
      question: "How do finance professionals help with career transitions into banking?",
      answer: "Finance mentors share insights on breaking into competitive areas like investment banking, understanding financial markets, building technical skills in modeling and analysis, and navigating the culture of different financial institutions. They provide real-world perspectives on what it takes to succeed."
   },
   {
      question: "What makes finance careers unique and challenging?",
      answer: "Finance careers offer high earning potential, intellectual challenges, and exposure to global markets. However, they often require long hours, continuous learning, and strong analytical skills. Our professionals help you understand these trade-offs and prepare for the demands of the industry."
   },
   {
      question: "Can I get guidance on finance certifications and qualifications?",
      answer: "Absolutely! Our finance professionals can advise on relevant certifications (CFA, FRM, CPA), MBA programs, and skill development. They understand which qualifications are valued most in different finance sectors and can guide your professional development strategy."
   },
   {
      question: "How do I prepare for finance interviews and technical assessments?",
      answer: "Finance mentors help you prepare for technical interviews, case studies, and modeling tests. They'll share frameworks for valuation, financial analysis, and market knowledge. Many have been through rigorous interview processes at top-tier institutions and can provide insider insights."
   }
]

export function FAQSectionFinanceBanking() {
   return (
      <Box sx={styles.section}>
         <Container maxWidth="md">
            <Box sx={styles.titleContainer}>
               <Typography variant="brandedH2" sx={styles.title}>
                  Frequently Asked Questions
               </Typography>
               <Typography variant="brandedBody" sx={styles.subtitle}>
                  Get answers to common questions about finance and banking careers and how CareerFairy can help you succeed in financial services.
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