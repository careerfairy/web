import { serialize } from "next-mdx-remote/serialize"
import he from "he"
import {
   HygraphResponseGridItem,
   HygraphResponseMarketingPageBlock,
   HygraphResponsePageBlock,
} from "../../types/cmsTypes"

export const parseBlocksMdx = async (
   blocks: (HygraphResponsePageBlock | HygraphResponseMarketingPageBlock)[]
) =>
   await Promise.all(
      blocks.map(async (block) => ({
         ...block,
         ...("gridSubtitle" in block &&
            block.gridSubtitle && {
               gridSubtitle: {
                  markdown: block.gridSubtitle,
                  mdx: await serialize(he.decode(block.gridSubtitle)),
               },
            }),
         ...("content" in block &&
            block.content && {
               content: {
                  markdown: block.content,
                  mdx: await serialize(he.decode(block.content)),
               },
            }),
         ...("gridItems" in block &&
            block.gridItems?.length && {
               gridItems: await parseGridItemsMdx(block.gridItems),
            }),
      }))
   )

export const parseGridItemsMdx = async (
   gridItems: HygraphResponseGridItem[]
) => {
   return await Promise.all(
      gridItems.map(async ({ content, ...gridItem }) => ({
         ...gridItem,
         ...(content && {
            content: {
               markdown: content,
               mdx: await serialize(he.decode(content)),
            },
         }),
      }))
   )
}
