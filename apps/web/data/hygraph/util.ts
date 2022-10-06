import { serialize } from "next-mdx-remote/serialize"
import he from "he"
import imageSize from "rehype-img-size"

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
                  mdx: await serializer(block.gridSubtitle),
               },
            }),
         ...("content" in block &&
            block.content && {
               content: {
                  markdown: block.content,
                  mdx: await serializer(block.content as string),
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
               mdx: await serializer(content),
            },
         }),
      }))
   )
}

const serializer = (markdown: string) =>
   serialize(he.decode(markdown), {
      mdxOptions: {
         // use the image size plugin, you can also specify which folder to load images from
         // in my case images are in /public/images/, so I just prepend 'public'
         rehypePlugins: [[imageSize, { dir: "public" }]],
      },
   })
