import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { Avatar, Button, Stack, Typography } from "@mui/material"

type Props = {
   companies: GroupPresenter[]
}

export const FeaturedCompaniesCarousel = ({ companies }: Props) => {
   console.log("🚀 ~ FeaturedCompaniesCarousel ~ companies:", companies)
   return (
      <Stack direction="row" spacing={2}>
         {companies.map((company) => (
            <FeatureCompanyCard key={company.id} company={company} />
         ))}
      </Stack>
   )
}

const FeatureCompanyCard = ({ company }: { company: GroupPresenter }) => {
   const industries = company.companyIndustries
      .map((industry) => industry.name)
      .join(", ")

   return (
      <Stack direction="row" spacing={2} sx={{ width: "340px" }}>
         <Avatar src={company.logoUrl} />
         <Stack>
            <Typography>{company.universityName}</Typography>
            <Typography>{industries}</Typography>
            <Typography>{company.companyCountry?.name}</Typography>
         </Stack>
         <Button>Follow</Button>
      </Stack>
   )
}
