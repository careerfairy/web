import { Stack } from "@mui/material"
import { Briefcase, Clock, MessageSquare } from "react-feather"
import { CopyAccordion } from "./AccordionComponents"
import { useTemporaryState } from "./useTemporaryActiveState"

const CARDS_METADATA = [
   {
      icon: <Clock />,
      title: "Post-event follow-up",
      description:
         "Hi [Name], it was great meeting you at [Event]! I enjoyed our conversation about [topic]. Let’s stay in touch!",
   },
   {
      icon: <MessageSquare />,
      title: "Requesting an introduction",
      description:
         "Hi [Name], I noticed you’re connected with [Person]. I’m really interested in their work in [field]. Would you be willing to introduce us?",
   },
   {
      icon: <Briefcase />,
      title: "Career Adivce",
      description:
         "Hi [Name], I hope you’re doing well! I admire your work in [specific field] and would love to hear your insights on [specific topic]. Would you be open to a chat?",
   },
]

const AccordionCard = ({ id, card }) => {
   const { isActive, setIsActive } = useTemporaryState()

   return (
      <CopyAccordion.Card key={id} disableGutters isActive={isActive}>
         <CopyAccordion.Summary>
            <Stack
               direction="row"
               alignItems="center"
               gap="8px"
               sx={{ "& svg": { width: "20px", height: "20px" } }}
            >
               {card.icon}
               {card.title}
            </Stack>
         </CopyAccordion.Summary>
         <CopyAccordion.Details>{card.description}</CopyAccordion.Details>
         <CopyAccordion.CopyButton
            clipboardContent={card.description}
            onClickCallback={() => setIsActive(true)}
         />
      </CopyAccordion.Card>
   )
}

export const NetworkingReachOut = () => {
   return (
      <CopyAccordion>
         {CARDS_METADATA.map((card, index) => (
            <AccordionCard key={index} id={index} card={card} />
         ))}
      </CopyAccordion>
   )
}
