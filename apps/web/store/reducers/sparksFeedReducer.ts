import {
   ArrayFilterFieldType,
   BooleanFilterFieldType,
   SPARK_REPLICAS,
} from "@careerfairy/shared-lib/sparks/search"
import {
   SparkCardNotificationTypes,
   SparkPresenter,
} from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { SparkCategory } from "@careerfairy/shared-lib/sparks/sparks"
import { UserSparksNotification } from "@careerfairy/shared-lib/users"
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { buildAlgoliaFilterString } from "components/custom-hook/spark/useSparkSearchAlgolia"
import algoliaRepo from "data/algolia/AlgoliaRepository"
import { sparkService } from "data/firebase/SparksService"
import { type RootState } from "store"
import { deserializeAlgoliaSearchResponse } from "util/algolia"

type Status = "idle" | "loading" | "failed"

const SPARKS_PAGE_SIZE = 20

export enum AutomaticActions {
   APPLY = "apply",
}

export type AddCardNotificationPayload = {
   position?: number
   type: SparkCardNotificationTypes
}

export type FetchedCompanyWithCreatorStatus =
   | "unset"
   | "started"
   | "ongoing"
   | "finished"

// Initial state
interface SparksState {
   originalSparkId: string | null
   sparks: SparkPresenter[]
   currentPlayingIndex: number
   hasMoreSparks: boolean
   fetchedCompanyWithCreatorStatus: FetchedCompanyWithCreatorStatus
   groupId: string | null
   creatorId: string | null
   userEmail: string | null
   numberOfSparksToFetch: number
   fetchNextSparksStatus: Status
   initialFetchStatus: Status
   initialSparksFetched: boolean
   fetchNextError: string | null
   initialFetchError: string | null
   eventNotification: UserSparksNotification | null
   sparkCategoryIds: SparkCategory["id"][]
   showEventDetailsDialog: boolean
   cardNotification: UserSparksNotification | null
   cameFromPageLink: string | null
   videosMuted: boolean
   playing: boolean
   eventToRegisterTo: string | null
   jobToOpen: string | null
   autoAction: AutomaticActions
   conversionCardInterval: number
   interactionSource: string
   contentTopicIds: string[]
   anonymousUserCountryCode?: string
   countrySpecificFeed?: boolean
   shouldShowLinkedInPopUpNotification: boolean
   isJobDialogOpen: boolean
   // Search mode state
   searchParameters: {
      query: string
      languages: string[]
      contentTopics: string[]
      companySizes: string[]
      industries: string[]
   }
   searchResultsExhausted: boolean
}

const initialState: SparksState = {
   originalSparkId: null,
   sparks: [],
   currentPlayingIndex: 0,
   hasMoreSparks: true,
   fetchedCompanyWithCreatorStatus: "unset",
   groupId: null,
   creatorId: null,
   userEmail: null,
   numberOfSparksToFetch: 10,
   initialFetchStatus: "loading",
   fetchNextSparksStatus: "idle",
   initialSparksFetched: false,
   fetchNextError: null,
   initialFetchError: null,
   sparkCategoryIds: [],
   eventNotification: null,
   showEventDetailsDialog: false,
   cardNotification: null,
   cameFromPageLink: null,
   videosMuted: true,
   playing: true,
   eventToRegisterTo: null,
   jobToOpen: null,
   autoAction: null,
   conversionCardInterval: 0,
   interactionSource: null,
   contentTopicIds: [],
   anonymousUserCountryCode: null,
   countrySpecificFeed: null,
   shouldShowLinkedInPopUpNotification: false,
   isJobDialogOpen: false,
   searchParameters: {
      query: "",
      languages: [],
      contentTopics: [],
      companySizes: [],
      industries: [],
   },
   searchResultsExhausted: false,
}

// Async thunk to fetch the next sparks
export const fetchNextSparks = createAsyncThunk(
   "sparks/fetchNext",
   async (_, { getState, dispatch }) => {
      const state = getState() as RootState

      const {
         sparks,
         hasMoreSparks,
         anonymousUserCountryCode,
         countrySpecificFeed,
      } = state.sparksFeed

      if (!hasMoreSparks) {
         return []
      }

      const lastSpark = sparks[sparks.length - 1]
      const sparkOptions = getSparkOptions(state)

      if (!anonymousUserCountryCode && countrySpecificFeed) {
         dispatch(disableCountrySpecificFeed())
         return sparkService.fetchNextSparks(null, sparkOptions)
      }

      return sparkService.fetchNextSparks(lastSpark, sparkOptions)
   }
)

// Async thunk to fetch the next spark IDs
export const fetchInitialSparksFeed = createAsyncThunk(
   "sparks/fetchInitial",
   async (_, { getState }) => {
      const state = getState() as RootState

      const sparkOptions = getSparkOptions(state)

      return sparkService.fetchFeed(sparkOptions)
   }
)

// Async thunk to fetch initial sparks using Algolia search
export const fetchInitialSparksFromSearch = createAsyncThunk(
   "sparks/fetchInitialFromSearch",
   async (_, { getState, dispatch }) => {
      const state = getState() as RootState
      const { searchParameters, sparks } = state.sparksFeed

      // If search query is empty, fall back to natural feed
      if (!searchParameters.query.trim()) {
         dispatch(fetchInitialSparksFeed())
         return { sparks: [], totalHits: 0, hasMore: false }
      }

      const filterOptions = {
         arrayFilters: {
            language: searchParameters.languages,
            contentTopicsTagIds: searchParameters.contentTopics,
            groupCompanySize: searchParameters.companySizes,
            groupCompanyIndustriesIdTags: searchParameters.industries,
         } as Partial<Record<ArrayFilterFieldType, string[]>>,
         booleanFilters: {
            published: true,
            groupPublicSparks: true,
         } as Partial<Record<BooleanFilterFieldType, boolean>>,
      }

      const filterString = buildAlgoliaFilterString(filterOptions)

      // Fetch search results
      const response = await algoliaRepo.searchSparks(
         searchParameters.query,
         filterString,
         0, // Start from first page
         SPARK_REPLICAS.PUBLISHED_AT_DESC,
         SPARKS_PAGE_SIZE
      )

      const deserializedHits = response.hits.map(
         deserializeAlgoliaSearchResponse
      )
      const searchSparks = deserializedHits.map((hit) =>
         SparkPresenter.createFromFirebaseObject(hit)
      )

      // Get the original spark (first spark from server-side)
      const originalSpark = sparks[0]

      // Remove the original spark from search results if it exists there
      const searchResultsWithoutOriginal = searchSparks.filter(
         (spark) => spark.id !== originalSpark?.id
      )

      // Combine: original spark first, then search results
      const combinedSparks = originalSpark
         ? [originalSpark, ...searchResultsWithoutOriginal]
         : searchResultsWithoutOriginal

      return {
         sparks: combinedSparks,
         totalHits: response.nbHits,
         hasMore: response.page < response.nbPages - 1,
      }
   }
)

// Async thunk to fetch next sparks using Algolia search
export const fetchNextSparksFromSearch = createAsyncThunk(
   "sparks/fetchNextFromSearch",
   async (_, { getState }) => {
      const state = getState() as RootState
      const { searchParameters, sparks } = state.sparksFeed

      const currentPage = Math.floor(sparks.length / SPARKS_PAGE_SIZE)

      const filterOptions = {
         arrayFilters: {
            language: searchParameters.languages,
            contentTopicsTagIds: searchParameters.contentTopics,
            groupCompanySize: searchParameters.companySizes,
            groupCompanyIndustriesIdTags: searchParameters.industries,
         } as Partial<Record<ArrayFilterFieldType, string[]>>,
         booleanFilters: {
            published: true,
            groupPublicSparks: true,
         } as Partial<Record<BooleanFilterFieldType, boolean>>,
      }

      const filterString = buildAlgoliaFilterString(filterOptions)

      const response = await algoliaRepo.searchSparks(
         searchParameters.query,
         filterString,
         currentPage + 1,
         SPARK_REPLICAS.PUBLISHED_AT_DESC,
         SPARKS_PAGE_SIZE
      )

      const deserializedHits = response.hits.map(
         deserializeAlgoliaSearchResponse
      )
      const sparkPresenters = deserializedHits.map((hit) =>
         SparkPresenter.createFromFirebaseObject(hit)
      )

      return {
         sparks: sparkPresenters,
         hasMore: response.page < response.nbPages - 1,
      }
   }
)

const sparksFeedSlice = createSlice({
   name: "Sparks Feed",
   initialState,
   reducers: {
      togglePlaying: (state) => {
         state.playing = !state.playing
      },
      setVideoPlaying: (state, action: PayloadAction<boolean>) => {
         state.playing = action.payload
      },
      setVideosMuted: (state, action: PayloadAction<boolean>) => {
         state.videosMuted = action.payload
      },
      setOriginalSparkId: (state, action: PayloadAction<string | null>) => {
         state.originalSparkId = action.payload
      },
      setSparks: (state, action: PayloadAction<SparkPresenter[]>) => {
         state.sparks = action.payload
         state.currentPlayingIndex = 0
      },
      setGroupId: (state, action: PayloadAction<SparksState["groupId"]>) => {
         state.groupId = action.payload
      },
      setCreatorId: (
         state,
         action: PayloadAction<SparksState["creatorId"]>
      ) => {
         state.creatorId = action.payload
      },
      setUserEmail: (state, action: PayloadAction<string>) => {
         state.userEmail = action.payload
      },
      setFetchedCompanyWithCreatorStatus: (
         state,
         action: PayloadAction<FetchedCompanyWithCreatorStatus>
      ) => {
         state.fetchedCompanyWithCreatorStatus = action.payload
      },
      setSparkCategories: (
         state,
         action: PayloadAction<SparkCategory["id"][]>
      ) => {
         state.sparkCategoryIds = action.payload

         if (action.payload.length) {
            state.fetchNextSparksStatus = "loading"
         }
      },
      swipeToSparkByIndex: (state, action: PayloadAction<number>) => {
         const newIndex = action.payload
         if (newIndex >= 0 && newIndex < state.sparks.length) {
            state.shouldShowLinkedInPopUpNotification = false
            state.currentPlayingIndex = newIndex
         }
      },
      setEventNotification: (
         state,
         action: PayloadAction<UserSparksNotification>
      ) => {
         state.eventNotification = action.payload
      },
      removeEventNotifications: (state) => {
         state.eventNotification = null
      },
      setCardEventNotification: (
         state,
         action: PayloadAction<UserSparksNotification>
      ) => {
         const endContentGroupNotificationIndex = state.sparks.findIndex(
            (spark) =>
               spark?.cardNotificationType === SparkCardNotificationTypes.GROUP
         )

         if (endContentGroupNotificationIndex > 0) {
            state.cardNotification = action.payload

            state.sparks = [
               ...state.sparks.slice(0, endContentGroupNotificationIndex),
               {
                  ...state.sparks[endContentGroupNotificationIndex],
                  cardNotificationType: SparkCardNotificationTypes.EVENT,
               },
               ...state.sparks.slice(endContentGroupNotificationIndex + 1),
            ]
         }
      },
      showEventDetailsDialog: (state, action: PayloadAction<boolean>) => {
         // when closing event dialog we want to remove the notification
         if (action.payload === false) {
            state.eventNotification = null
         }
         state.showEventDetailsDialog = action.payload
      },
      addCardNotificationToSparksList: (
         state,
         action: PayloadAction<AddCardNotificationPayload>
      ) => {
         const lastPosition = state.sparks.length

         const { position = lastPosition, type } = action.payload

         const filteredSparks = state.sparks.filter(
            (spark) => spark?.cardNotificationType !== type
         )

         state.sparks = [
            ...filteredSparks.slice(0, position),
            {
               ...filteredSparks[0],
               isCardNotification: true,
               cardNotificationType: type,
            },
            ...filteredSparks.slice(position),
         ]
      },
      removeGroupId: (state) => {
         state.groupId = null
         state.hasMoreSparks = true
      },
      removeCreatorId: (state) => {
         state.creatorId = null
         state.hasMoreSparks = true
      },
      setCameFromPageLink: (state, action: PayloadAction<string>) => {
         state.cameFromPageLink = action.payload
      },
      setInteractionSource: (state, action: PayloadAction<string>) => {
         state.interactionSource = action.payload
      },
      setContentTopicIds: (state, action: PayloadAction<string[]>) => {
         state.contentTopicIds = action.payload
      },
      setEventToRegisterTo: (state, action: PayloadAction<string>) => {
         state.eventToRegisterTo = action.payload
      },
      setJobToOpen: (state, action: PayloadAction<string>) => {
         state.jobToOpen = action.payload
      },
      setAutoAction: (state, action: PayloadAction<AutomaticActions>) => {
         state.autoAction = action.payload
      },
      setConversionCardInterval: (state, action: PayloadAction<number>) => {
         state.conversionCardInterval = action.payload
      },
      setShouldShowLinkedInPopUpNotification: (
         state,
         action: PayloadAction<boolean>
      ) => {
         state.shouldShowLinkedInPopUpNotification = action.payload
      },
      removeNotificationsByType: (
         state,
         action: PayloadAction<SparkCardNotificationTypes>
      ) => {
         const notificationType = action.payload

         const filteredSparks = state.sparks.filter(
            (spark) => spark.cardNotificationType !== notificationType
         )

         if (filteredSparks.length !== state.sparks.length) {
            state.sparks = filteredSparks
         }
      },
      resetSparksFeed: (state) => {
         state.sparks = []
         state.currentPlayingIndex = 0
         state.hasMoreSparks = true
         state.fetchedCompanyWithCreatorStatus = "unset"
         state.creatorId = null
         state.initialFetchStatus = "idle"
         state.initialSparksFetched = false
         state.fetchNextSparksStatus = "idle"
         state.fetchNextError = null
         state.initialFetchError = null
         state.eventNotification = null
         state.sparkCategoryIds = []
         state.showEventDetailsDialog = false
         state.originalSparkId = null
         state.cameFromPageLink = null
         state.cardNotification = null
         state.videosMuted = false
         state.playing = true
         state.conversionCardInterval = 0
         state.shouldShowLinkedInPopUpNotification = false
      },
      disableCountrySpecificFeed: (state) => {
         state.countrySpecificFeed = null
      },
      setIsJobDialogOpen: (state, action: PayloadAction<boolean>) => {
         state.isJobDialogOpen = action.payload
      },
      setSearchParameters: (
         state,
         action: PayloadAction<SparksState["searchParameters"]>
      ) => {
         state.searchParameters = action.payload
      },
      transitionToNaturalFeed: (state) => {
         state.searchResultsExhausted = true
         state.hasMoreSparks = true // Reset to allow natural feed fetching
      },
      resetSearchTransition: (state) => {
         state.searchResultsExhausted = false
      },
   },
   extraReducers: (builder) => {
      builder
         .addCase(fetchNextSparks.pending, (state) => {
            state.fetchNextSparksStatus = "loading"
         })
         .addCase(
            fetchNextSparks.fulfilled,
            (state, action: PayloadAction<SparkPresenter[]>) => {
               const {
                  sparks,
                  numberOfSparksToFetch,
                  anonymousUserCountryCode,
               } = state

               state.fetchNextSparksStatus = "idle"

               // We don't mind duplicates since the feed is endless
               state.sparks = insertNotificationIfNeeded(state, [
                  ...sparks,
                  ...action.payload,
               ])

               if (
                  action.payload.length < numberOfSparksToFetch &&
                  anonymousUserCountryCode
               ) {
                  state.anonymousUserCountryCode = null
               }

               if (action.payload.length === 0) {
                  state.hasMoreSparks = false
               }
            }
         )
         .addCase(fetchNextSparks.rejected, (state, action) => {
            state.fetchNextSparksStatus = "failed"
            state.fetchNextError = action.error.message
         })
         .addCase(fetchInitialSparksFeed.pending, (state) => {
            state.initialFetchStatus = "loading"
         })
         .addCase(
            fetchInitialSparksFeed.fulfilled,
            (
               state,
               action: PayloadAction<{
                  sparks: SparkPresenter[]
                  anonymousUserCountryCode?: string
               }>
            ) => {
               const { sparks, numberOfSparksToFetch } = state
               const { sparks: sparksPayload, anonymousUserCountryCode } =
                  action.payload

               state.initialFetchStatus = "idle"
               state.initialSparksFetched = true

               const newSparks = insertNotificationIfNeeded(
                  state,
                  mergeSparks(sparks, sparksPayload)
               )

               state.sparks = newSparks
               state.anonymousUserCountryCode = anonymousUserCountryCode
               state.countrySpecificFeed = Boolean(anonymousUserCountryCode)

               if (sparksPayload.length < numberOfSparksToFetch) {
                  state.hasMoreSparks = false
               }
            }
         )
         .addCase(fetchInitialSparksFeed.rejected, (state, action) => {
            state.initialFetchStatus = "failed"
            state.initialFetchError = action.error.message
         })
         .addCase(fetchInitialSparksFromSearch.pending, (state) => {
            state.initialFetchStatus = "loading"
         })
         .addCase(
            fetchInitialSparksFromSearch.fulfilled,
            (
               state,
               action: PayloadAction<{
                  sparks: SparkPresenter[]
                  totalHits: number
                  hasMore: boolean
               }>
            ) => {
               const { sparks: newSparks, hasMore } = action.payload

               state.initialFetchStatus = "idle"
               state.initialSparksFetched = true

               const sparksWithNotifications = insertNotificationIfNeeded(
                  state,
                  newSparks
               )
               state.sparks = sparksWithNotifications

               state.currentPlayingIndex = 0

               state.hasMoreSparks = hasMore
            }
         )
         .addCase(fetchInitialSparksFromSearch.rejected, (state, action) => {
            state.initialFetchStatus = "failed"
            state.initialFetchError = action.error.message
         })
         .addCase(fetchNextSparksFromSearch.pending, (state) => {
            state.fetchNextSparksStatus = "loading"
         })
         .addCase(
            fetchNextSparksFromSearch.fulfilled,
            (
               state,
               action: PayloadAction<{
                  sparks: SparkPresenter[]
                  hasMore: boolean
               }>
            ) => {
               const { sparks } = state
               const { sparks: newSparks, hasMore } = action.payload

               state.fetchNextSparksStatus = "idle"
               state.sparks = insertNotificationIfNeeded(state, [
                  ...sparks,
                  ...newSparks,
               ])

               // If no more search results, transition to natural feed
               if (!hasMore) {
                  state.searchResultsExhausted = true
                  state.hasMoreSparks = true // Reset to allow natural feed fetching
               } else {
                  state.hasMoreSparks = hasMore
               }
            }
         )
         .addCase(fetchNextSparksFromSearch.rejected, (state, action) => {
            state.fetchNextSparksStatus = "failed"
            state.fetchNextError = action.error.message
         })
   },
})

/**
 * Merge the existing sparks with the new sparks and remove duplicates
 */
const mergeSparks = (
   existingSparks: SparkPresenter[],
   newSparks: SparkPresenter[]
) => {
   return [
      ...existingSparks,
      ...newSparks.filter(
         (spark) => !existingSparks.find((s) => s.id === spark.id)
      ),
   ]
}

/**
 * Get the spark options from the state
 * @param state - The redux state
 * @returns spark options
 */
const getSparkOptions = (state: RootState) => {
   const {
      numberOfSparksToFetch,
      groupId,
      creatorId,
      userEmail,
      sparkCategoryIds,
      contentTopicIds,
      anonymousUserCountryCode,
   } = state.sparksFeed

   return {
      numberOfSparks: numberOfSparksToFetch,
      sparkCategoryIds,
      contentTopicIds,
      anonymousUserCountryCode,
      creatorId,
      groupId,
      userId: userEmail,
   }
}

/**
 * Inserts card notifications into the array of sparks if needed, based on the conversion card interval.
 *
 * @param state - The current state.
 * @param sparks - The array of sparks to be processed.
 * @returns The array of sparks with card notifications inserted.
 */
const insertNotificationIfNeeded = (
   state: SparksState,
   sparks: SparkPresenter[]
): SparkPresenter[] => {
   const conversionCardInterval = state.conversionCardInterval

   // Copy the array of sparks to avoid mutating the original array
   const results = sparks.slice()

   // If the conversion card interval is 0, no need to insert notifications
   if (conversionCardInterval === 0) {
      return results
   }

   const lastCardNotificationIndex = results.findLastIndex(
      (spark) => spark.isCardNotification
   )

   // Set the initial index to insert notifications after the last one if it exists, otherwise, start from the beginning
   const initialIndex =
      lastCardNotificationIndex > 0 ? lastCardNotificationIndex + 1 : 0

   let alreadyHaveNotifications = false

   // Iterate through the sparks array to insert card notifications based on the conversion card interval
   for (
      let index = initialIndex;
      index < results.length;
      index += conversionCardInterval + (alreadyHaveNotifications ? 1 : 0)
   ) {
      if (index !== initialIndex) {
         alreadyHaveNotifications = true

         const sparkNotificationToAdd = {
            ...results[index],
            isCardNotification: true,
            cardNotificationType: SparkCardNotificationTypes.CONVERSION,
         } as SparkPresenter

         // Insert the spark notification at the calculated index based on the conversion card interval
         results.splice(index, 0, sparkNotificationToAdd)
      }
   }

   return results
}

export const {
   setOriginalSparkId,
   setSparks,
   setGroupId,
   setCreatorId,
   setUserEmail,
   setSparkCategories,
   resetSparksFeed,
   swipeToSparkByIndex,
   setEventNotification,
   removeEventNotifications,
   showEventDetailsDialog,
   addCardNotificationToSparksList,
   removeGroupId,
   removeCreatorId,
   setFetchedCompanyWithCreatorStatus,
   setCardEventNotification,
   setCameFromPageLink,
   setInteractionSource,
   setContentTopicIds,
   setEventToRegisterTo,
   setJobToOpen,
   setAutoAction,
   setVideosMuted,
   setVideoPlaying,
   setShouldShowLinkedInPopUpNotification,
   togglePlaying,
   setConversionCardInterval,
   removeNotificationsByType,
   disableCountrySpecificFeed,
   setIsJobDialogOpen,
   setSearchParameters,
   transitionToNaturalFeed,
   resetSearchTransition,
} = sparksFeedSlice.actions

export default sparksFeedSlice.reducer
