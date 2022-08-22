import CompaniesSection from "components/views/landing/CompaniesSection"
import { Company } from "../../../types/cmsTypes"

const CompanyLogos = ({ title, companies }: Props) => {
   return <CompaniesSection title={title} companies={companies} />
}

type Props = {
   title: string
   companies: Company[]
}
export default CompanyLogos
