import FormSectionHeader from "../../FormSectionHeader"
import { FormBrandedTextField } from "components/views/common/inputs/BrandedTextField"

const ReasonsToJoin = () => {
   return (
      <>
         <FormSectionHeader
            title="Three Reasons Why To Join"
            subtitle="Share three irresistible reasons for talent to join your live stream!"
            divider
         />
         <FormBrandedTextField
            name="general.reasonsToJoin[0]"
            label="Reason #1"
            fullWidth
            requiredText="(required)"
            placeholder="Ex: Find out, which job benefits await you as a [title of open position/program]"
         />
         <FormBrandedTextField
            name="general.reasonsToJoin[1]"
            label="Reason #2"
            fullWidth
            requiredText="(required)"
            placeholder="Ex: Learn what skills from your studies you can apply in this working environment."
         />
         <FormBrandedTextField
            name="general.reasonsToJoin[2]"
            label="Reason #3"
            fullWidth
            requiredText="(required)"
            placeholder="Ex: Start job application process in-stream and skip first round of interviews."
         />
      </>
   )
}

export default ReasonsToJoin
