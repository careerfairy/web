import CompaniesSection from "components/views/landing/CompaniesSection"
import { Company } from "../../../types/cmsTypes"
import { PillsBackground } from "../../../materialUI/GlobalBackground/GlobalBackGround"

const CompanyLogos = ({ title, companies }: Props) => {
   return (
      <PillsBackground minHeight={"fit-content"}>
         <CompaniesSection title={title} companies={companies} />
      </PillsBackground>
   )
}

type Props = {
   title: string
   companies: Company[]
}
export default CompanyLogos
