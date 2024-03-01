import { Wish } from "@careerfairy/shared-lib/wishes"
import Container from "@mui/material/Container"
import { Grid, Pagination, PaginationItem } from "@mui/material"
import CreateAndFilter from "../../components/views/wishlist/CreateAndFilter"
import Header from "../../components/views/wishlist/Header"
import GeneralLayout from "../../layouts/GeneralLayout"
import { useRouter } from "next/router"
import { SortType } from "../../components/views/common/filter/FilterMenu"
import { useState } from "react"
import algoliaRepo from "../../data/algolia/AlgoliaRepository"
import WishSection from "../../components/views/wishlist/WishSection"
import Link from "../../components/views/common/Link"
import Box from "@mui/material/Box"
import { GetServerSideProps } from "next"
import { useUpdateEffect } from "react-use"
import SEO from "../../components/util/SEO"
import { getBaseUrl } from "../../components/helperFunctions/HelperFunctions"
import { SearchResponse } from "@algolia/client-search"

const pageSize = 10

const getQueryVariables = (query) => {
   const sortType = query.sortType as SortType
   const interests = query.interests as string
   const searchQuery = query.search as string
   const currentPage = parseInt((query.page as string) || "0")

   return { sortType, interests, searchQuery, currentPage }
}
interface Props {
   serverSearchResponse: SearchResponse<Wish> | null
}

export type HandleAddNewWishToHits = (wish: Wish) => void

const Wishlist = ({ serverSearchResponse }: Props) => {
   const { query, pathname } = useRouter()
   const [loading, setLoading] = useState(false)
   const [loadingError, setLoadingError] = useState(null)
   const [searchResponse, setSearchResponse] =
      useState<SearchResponse<Wish> | null>(serverSearchResponse)
   const { currentPage, sortType, interests, searchQuery } =
      getQueryVariables(query)

   useUpdateEffect(() => {
      // eslint-disable-next-line no-extra-semi
      ;(async function search() {
         try {
            setLoading(true)
            const newSearchResponse = await algoliaRepo.searchWishes(
               searchQuery,
               {
                  sortType: sortType,
                  ...(interests && {
                     targetInterestIds: interests.split(","),
                  }),
                  hitsPerPage: pageSize,
                  page: currentPage,
               }
            )

            setSearchResponse(newSearchResponse)
         } catch (e) {
            setLoadingError(e)
         }
         setLoading(false)
      })()
   }, [searchQuery, sortType, interests, currentPage])

   const handleAddNewWishToHits = (wish: Wish) => {
      if (searchResponse) {
         setSearchResponse((prev) => ({
            ...prev,
            hits: [convertWishToHit(wish), ...searchResponse.hits],
         }))
      }
   }

   const convertWishToHit = (wish: Wish) => {
      return {
         ...wish,
         objectID: wish.id,
      }
   }

   return (
      <>
         <SEO
            title="CareerFairy | Wishlist"
            description={
               "Are there any companies you’d like to see on CareerFairy? " +
               "Add companies or topics that you wish to see hosted on CareerFairy."
            }
            canonical={`${getBaseUrl()}${pathname}`}
         />
         <GeneralLayout backgroundColor={"white"} persistent>
            <Container sx={{ py: 2 }} maxWidth={"md"}>
               <Grid container spacing={2}>
                  <Grid item xs={12}>
                     <Header
                        title={"Wishlist"}
                        subtitle={
                           "Add a company or topic that you’d like to see hosted on CareerFairy"
                        }
                     />
                  </Grid>
                  <Grid item xs={12}>
                     <CreateAndFilter
                        handleAddNewWishToHits={handleAddNewWishToHits}
                     />
                  </Grid>
                  <Grid item xs={12}>
                     <WishSection
                        loading={loading}
                        loadingError={loadingError}
                        wishes={searchResponse?.hits || []}
                        empty={searchResponse?.nbHits === 0}
                     />
                  </Grid>
                  <Grid item xs={12}>
                     <Box sx={{ display: "flex", justifyContent: "center" }}>
                        <Pagination
                           defaultPage={currentPage + 1}
                           variant={"outlined"}
                           page={currentPage + 1}
                           color={"primary"}
                           hidden={loading}
                           hideNextButton={searchResponse?.nbHits === 0}
                           hidePrevButton={searchResponse?.nbHits === 0}
                           count={searchResponse?.nbPages || 0}
                           shape="rounded"
                           renderItem={(item) => (
                              <PaginationItem
                                 {...item}
                                 component={Link}
                                 rel={
                                    item.type === "next"
                                       ? "next"
                                       : item.type === "previous"
                                       ? "prev"
                                       : item.type
                                 }
                                 href={{
                                    pathname: pathname,
                                    query: {
                                       ...query,
                                       page: item.page - 1,
                                    },
                                 }}
                              />
                           )}
                        />
                     </Box>
                  </Grid>
               </Grid>
            </Container>
         </GeneralLayout>
      </>
   )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
   const queryVars = getQueryVariables(context.query)

   let newSearchResponse = null
   try {
      newSearchResponse = await algoliaRepo.searchWishes(
         queryVars.searchQuery,
         {
            sortType: queryVars.sortType,
            ...(queryVars.interests && {
               targetInterestIds: queryVars.interests.split(","),
            }),
            hitsPerPage: pageSize,
            page: queryVars.currentPage,
         }
      )
   } catch (e) {
      console.error(e)
   }
   return {
      props: {
         serverSearchResponse: newSearchResponse,
      },
   }
}

export default Wishlist
