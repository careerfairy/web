import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { Stack } from "@mui/material"

type Props = {
   sparks: Spark[]
}

// TODO: pass limit
const SparksTagsContent = ({ sparks }: Props) => {
   console.log(
      "🚀 ~ SparksTagsContent Sparks:",
      sparks?.map((s) => s.id)
   )

   return (
      <>
         <h4>HI SPARKY: with {sparks?.length} SPARKS!!</h4>

         {sparks?.map((e, i) => {
            return (
               <Stack key={i}>
                  <h5>{e.id}</h5>
                  <h6>CT: {e?.contentTopicsTagIds}</h6>
                  <h6>LG: {e.languageTagIds}</h6>
               </Stack>
            )
         })}
      </>
   )
}

export default SparksTagsContent
