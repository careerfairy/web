import { serialize } from "next-mdx-remote/serialize"
import he from "he"
import {
   HygraphResponseMarketingPageBlock,
   HygraphResponsePageBlock,
} from "../../types/cmsTypes"

const parseBlocksMdx = async (
   blocks: (HygraphResponseMarketingPageBlock | HygraphResponsePageBlock)[]
) =>
   await Promise.all(
      blocks.map(async ({ columns, content, gridSubtitle, ...block }) => ({
         ...(gridSubtitle && {
            gridSubtitle: {
               markdown: gridSubtitle,
               mdx: await serialize(he.decode(gridSubtitle)),
            },
         }),
         ...(content && {
            content: {
               markdown: content,
               mdx: await serialize(he.decode(content)),
            },
         }),
         ...block,
         ...(columns &&
            columns.length && {
               columns: await parseColumnsMdx(columns),
            }),
      }))
   )

export { parseBlocksMdx }
