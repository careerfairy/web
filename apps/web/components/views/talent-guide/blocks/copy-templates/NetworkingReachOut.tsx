import { Stack } from "@mui/material"
import { Clock } from "react-feather"
import { CopyAccordion } from "./AccordionComponents"
import { useTemporaryActiveState } from "./useTemporaryActiveState"

const CARDS_METADATA = [
   {
      icon: <Clock />,
      title: "Anfrage an Recruiter*in",
      description:
         "Hallo [Name], ich habe deinen Livestream auf CareerFairy geschaut und (spezifische Punkte) stachen besonders für mich heraus. Da ich (Studiengang XYZ) studiere, sind diese Punkte besonders spannend für mich. Gerne würde ich dir dazu weiterführende Fragen stellen und mich zu den Themen austauschen!",
   },
   {
      icon: <Clock />,
      title: "Anfrage an Speaker*in aus Fachbereich",
      description:
         "Hallo [Name], deine Inputs und Ideen rund um das (Thema einfügen) bei dem Livestream auf CareerFairy fand ich super inspirierend. Da ich aktuell (Studiengang einfügen) studiere und hoffe, in deinem Fachbereich mal einen Job zu ergattern, würde ich mich gerne mehr zu dem Thema mit dir austauschen!",
   },
]

const AccordionCard = ({ card, ...props }) => {
   const { isActive, setIsActive } = useTemporaryActiveState()

   return (
      <CopyAccordion.Card {...props} disableGutters isActive={isActive}>
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
            <AccordionCard key={index} card={card} />
         ))}
      </CopyAccordion>
   )
}
