import { GroupedTags } from "@careerfairy/shared-lib/constants/tags"

type Props = {
   tags: GroupedTags
   title: string
}

const CustomJobsTagsContent = ({ tags, title }: Props) => {
   console.log("🚀 ~ CustomJobsTagsContent ~ title:", title)
   console.log("🚀 ~ CustomJobsTagsContent ~ tags:", tags)

   return <></>
}

export default CustomJobsTagsContent
