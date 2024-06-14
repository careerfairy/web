import { Identifiable } from "@careerfairy/shared-lib/commonTypes"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { syncCustomJobLinkedContentTags } from "../../tags"
import {
   createNewAndOldCustomJobData,
   createNewCustomJobsData,
   createNewLivestreamsData,
} from "../../testHelpers"
import { getCustomJobsByLinkedContentIds } from "../../utils/utils"

/**
 * Test Overview
 *
 * These tests are to cover most scenarios when synchronizing tags from a customJob to its linked content, in this case
 * Livestreams, where the consistency of the data must be ensured taking into consideration other customJobs which might be linked
 * to the Livestreams as well as prevent tag duplication and other modification scenarios.
 *
 *
 * With the way function syncCustomJobLinkedContentTags was implemented in a generic way, it leaves the burden
 * of determining customJob links (to Livestreams in this case) via async functions passed as parameters, and during these unit tests
 * there will be no connection to the database, meaning the relationships must be stored in memory, reason why the global constants below are used
 * during various tests.
 *
 * Special notice to 'allCustomJobs', as the syncCustomJobLinkedContentTags function receives a lambda which checks this variable
 * for customJobs by ids, meaning if it is not present in this variable the syncCustomJobLinkedContentTags function will not behave as expected
 * since it will not have a view of all existing jobs. Locally created customJobs or Livestreams can be added to this list, see example in
 * test 'Should add live stream tags if link is added to customJob'.
 */
const getId = <T extends Identifiable>(data: T) => data.id

const eventsWithoutTags = createNewLivestreamsData(2)

// These events must be referenced by at least a custom job with these tags
const eventsWithExistingTags = createNewLivestreamsData(3, {
   linkedCustomJobsTagIds: ["SupplyChainLogistics", "ProductManagement"],
})

// Not used when creating customJob global data, meaning can be used for creating
// local customJobs only linked to these events, useful for testing
// deleting customJobs and the events only linked to that customJob
// must have its tags removed
const singleLinkEventsWithExistingTags = createNewLivestreamsData(3, {
   linkedCustomJobsTagIds: ["SupplyChainLogistics", "ProductManagement"],
})

const allEvents = eventsWithoutTags
   .concat(eventsWithExistingTags)
   .concat(singleLinkEventsWithExistingTags)

const customJobsWithLivestreams = createNewCustomJobsData(2, {
   livestreams: eventsWithExistingTags.map(getId),
   businessFunctionTagIds: ["SupplyChainLogistics", "ProductManagement"],
})

const allCustomJobs = createNewCustomJobsData(2).concat(
   customJobsWithLivestreams
)

describe("Adding business function tags to customJobs - Live streams", () => {
   test("Should not update linked live streams content when the custom job tags does not change", async () => {
      const { newCustomJobData: newJob, oldCustomJobData: oldJob } =
         createNewAndOldCustomJobData(
            {
               livestreams: allEvents.map(getId),
               businessFunctionTagIds: ["Legal"],
            },
            {
               livestreams: allEvents.map(getId),
               businessFunctionTagIds: ["Legal"],
            }
         )

      const updatedLinkedEventsContent = await syncCustomJobLinkedContentTags(
         newJob,
         oldJob,
         { isCreate: false, isUpdate: true, isDelete: false },
         (job) => job.livestreams,
         getEventsByIds,
         (eventIds) =>
            getCustomJobsByLinkedContentIds(
               allCustomJobs,
               "livestreams",
               eventIds
            )
      )

      expect(updatedLinkedEventsContent.length).toBe(0)
   })

   test("Should update live stream tags when customJob tag is added", async () => {
      const addedTags = ["Legal", "Finance"]
      const { newCustomJobData: newJob, oldCustomJobData: oldJob } =
         createNewAndOldCustomJobData(
            {
               livestreams: eventsWithoutTags.map(getId),
               businessFunctionTagIds: addedTags,
            },
            {
               livestreams: [],
               businessFunctionTagIds: [],
            }
         )

      const updatedLinkedEventsContent = await syncCustomJobLinkedContentTags(
         newJob,
         oldJob,
         { isCreate: true, isUpdate: false, isDelete: false },
         (job) => job.livestreams,
         getEventsByIds,
         (eventIds) =>
            getCustomJobsByLinkedContentIds(
               allCustomJobs,
               "livestreams",
               eventIds
            )
      )

      expect(updatedLinkedEventsContent.length).toBe(eventsWithoutTags.length)
      updatedLinkedEventsContent.forEach((updatedEvent) => {
         expect(updatedEvent.linkedCustomJobsTagIds.length).toBe(
            addedTags.length
         )
         expect(updatedEvent.linkedCustomJobsTagIds).toStrictEqual(addedTags)
      })
   })

   test("Should update live stream tags when customJob tag is removed", async () => {
      const updatedTags = ["Legal"]
      const { newCustomJobData: newJob, oldCustomJobData: oldJob } =
         createNewAndOldCustomJobData(
            {
               livestreams: eventsWithoutTags.map(getId),
               businessFunctionTagIds: updatedTags,
            },
            {
               livestreams: eventsWithoutTags.map(getId),
               businessFunctionTagIds: ["Legal", "Finance"],
            }
         )

      const updatedLinkedEventsContent = await syncCustomJobLinkedContentTags(
         newJob,
         oldJob,
         { isCreate: false, isUpdate: true, isDelete: false },
         (job) => job.livestreams,
         getEventsByIds,
         (eventIds) =>
            getCustomJobsByLinkedContentIds(
               allCustomJobs,
               "livestreams",
               eventIds
            )
      )

      expect(updatedLinkedEventsContent.length).toBe(eventsWithoutTags.length)
      updatedLinkedEventsContent.forEach((updatedEvent) => {
         expect(updatedEvent.linkedCustomJobsTagIds).toStrictEqual(updatedTags)
      })
   })

   test("Should clear live stream (associated to single job) tags when customJob is deleted", async () => {
      const { newCustomJobData: newJob, oldCustomJobData: oldJob } =
         createNewAndOldCustomJobData(
            {
               livestreams: eventsWithExistingTags.map(getId),
               businessFunctionTagIds: [
                  "SupplyChainLogistics",
                  "ProductManagement",
               ],
            },
            {
               livestreams: eventsWithExistingTags.map(getId),
               businessFunctionTagIds: [
                  "SupplyChainLogistics",
                  "ProductManagement",
               ],
            }
         )

      const updatedLinkedEventsContent = await syncCustomJobLinkedContentTags(
         newJob,
         oldJob,
         { isCreate: false, isUpdate: false, isDelete: true },
         (job) => job.livestreams,
         getEventsByIds,
         (eventIds) =>
            getCustomJobsByLinkedContentIds(
               allCustomJobs,
               "livestreams",
               eventIds
            )
      )

      expect(updatedLinkedEventsContent.length).toBe(
         eventsWithExistingTags.length
      )
      updatedLinkedEventsContent.forEach((updatedEvent) => {
         expect(updatedEvent.linkedCustomJobsTagIds.length).not.toBe(0)
         expect(eventsWithExistingTags.map(getId)).toContain(updatedEvent.id)
      })
   })

   test("Should clear live stream (associated to multiple jobs) tags only from deleted job tags when customJob is deleted", async () => {
      const jobTags = ["SupplyChainLogistics", "ProductManagement"]
      const { newCustomJobData: newJob, oldCustomJobData: oldJob } =
         createNewAndOldCustomJobData(
            {
               livestreams: eventsWithExistingTags.map(getId),
               businessFunctionTagIds: jobTags,
            },
            {
               livestreams: eventsWithExistingTags.map(getId),
               businessFunctionTagIds: jobTags,
            }
         )

      const updatedLinkedEventsContent = await syncCustomJobLinkedContentTags(
         newJob,
         oldJob,
         { isCreate: false, isUpdate: false, isDelete: true },
         (job) => job.livestreams,
         getEventsByIds,
         (eventIds) =>
            getCustomJobsByLinkedContentIds(
               allCustomJobs,
               "livestreams",
               eventIds
            )
      )

      expect(updatedLinkedEventsContent.length).toBe(
         eventsWithExistingTags.length
      )
      updatedLinkedEventsContent.forEach((updatedEvent) => {
         expect(updatedEvent.linkedCustomJobsTagIds.length).toBeGreaterThan(0)
         expect(updatedEvent.linkedCustomJobsTagIds).not.toContain(jobTags)
      })
   })

   test("Should remove live stream tags if link is removed from customJob", async () => {
      const jobTags = ["SupplyChainLogistics", "ProductManagement"]

      const removedEvent = singleLinkEventsWithExistingTags.at(0)
      const newEventIds = singleLinkEventsWithExistingTags.slice(1).map(getId)
      const oldEventIds = singleLinkEventsWithExistingTags.map(getId)
      const { newCustomJobData: newJob, oldCustomJobData: oldJob } =
         createNewAndOldCustomJobData(
            {
               livestreams: newEventIds,
               businessFunctionTagIds: jobTags,
            },
            {
               livestreams: oldEventIds,
               businessFunctionTagIds: jobTags,
            }
         )

      const updatedLinkedEventsContent = await syncCustomJobLinkedContentTags(
         newJob,
         oldJob,
         { isCreate: false, isUpdate: true, isDelete: false },
         (job) => job.livestreams,
         getEventsByIds,
         (eventIds) =>
            getCustomJobsByLinkedContentIds(
               allCustomJobs,
               "livestreams",
               eventIds
            )
      )
      // One live stream was removed so only one update to be done
      expect(updatedLinkedEventsContent.length).toBe(1)
      expect(updatedLinkedEventsContent.at(0).id).toBe(removedEvent.id)
      expect(
         updatedLinkedEventsContent.at(0).linkedCustomJobsTagIds.length
      ).toBe(0)
   })

   test("Should add live stream tags if link is added to customJob", async () => {
      const livestreamToAdd = createNewLivestreamsData(15)

      // Add to global events to be able to be fetched
      livestreamToAdd.forEach((event) => allEvents.push(event))

      const addedIds = livestreamToAdd.map(getId)

      const tags = ["Legal", "Finance"]
      const { newCustomJobData: newJob, oldCustomJobData: oldJob } =
         createNewAndOldCustomJobData(
            {
               livestreams: eventsWithoutTags
                  .concat(livestreamToAdd)
                  .map(getId),
               businessFunctionTagIds: tags,
            },
            {
               livestreams: eventsWithoutTags.map(getId),
               businessFunctionTagIds: tags,
            }
         )

      const updatedLinkedEventsContent = await syncCustomJobLinkedContentTags(
         newJob,
         oldJob,
         { isCreate: false, isUpdate: true, isDelete: false },
         (job) => job.livestreams,
         getEventsByIds,
         (eventIds) =>
            getCustomJobsByLinkedContentIds(
               allCustomJobs,
               "livestreams",
               eventIds
            )
      )

      expect(updatedLinkedEventsContent.length).toBe(addedIds.length)
      updatedLinkedEventsContent.forEach((updatedEvent) => {
         expect(addedIds).toContain(updatedEvent.id)
         expect(updatedEvent.linkedCustomJobsTagIds.length).toBe(tags.length)
         expect(updatedEvent.linkedCustomJobsTagIds).toStrictEqual(tags)
      })
   })

   test("Should not remove tag after deleting customJob if live stream is linked to another customJob with same tag", async () => {
      // The linked events have this tag and others, deleting this job means no tag shall
      // be deleted, as it is present in the events via other customJob (defined globally)
      const jobTags = ["SupplyChainLogistics", "ProductManagement"]
      const { newCustomJobData: newJob, oldCustomJobData: oldJob } =
         createNewAndOldCustomJobData(
            {
               livestreams: eventsWithExistingTags.map(getId),
               businessFunctionTagIds: jobTags,
            },
            {
               livestreams: eventsWithExistingTags.map(getId),
               businessFunctionTagIds: jobTags,
            }
         )

      const updatedLinkedEventsContent = await syncCustomJobLinkedContentTags(
         newJob,
         oldJob,
         { isCreate: false, isUpdate: false, isDelete: true },
         (job) => job.livestreams,
         getEventsByIds,
         (eventIds) =>
            getCustomJobsByLinkedContentIds(
               allCustomJobs,
               "livestreams",
               eventIds
            )
      )

      expect(updatedLinkedEventsContent.length).toBe(
         eventsWithExistingTags.length
      )
      updatedLinkedEventsContent.forEach((updatedEvent) => {
         expect(updatedEvent.linkedCustomJobsTagIds.length).toBe(jobTags.length)
         expect(updatedEvent.linkedCustomJobsTagIds).toStrictEqual(jobTags)
      })
   })

   test("Should not duplicate tag, if live stream has already the same tag from other customJob - create", async () => {
      const jobTags = ["ProductManagement"]
      const { newCustomJobData: newJob, oldCustomJobData: oldJob } =
         createNewAndOldCustomJobData(
            {
               livestreams: eventsWithExistingTags.map(getId),
               businessFunctionTagIds: jobTags,
            },
            {
               livestreams: [],
               businessFunctionTagIds: [],
            }
         )

      const updatedLinkedEventsContent = await syncCustomJobLinkedContentTags(
         newJob,
         oldJob,
         { isCreate: true, isUpdate: false, isDelete: false },
         (job) => job.livestreams,
         getEventsByIds,
         (eventIds) =>
            getCustomJobsByLinkedContentIds(
               allCustomJobs,
               "livestreams",
               eventIds
            )
      )

      expect(updatedLinkedEventsContent.length).toBe(
         eventsWithExistingTags.length
      )
      updatedLinkedEventsContent.forEach((updatedEvent) => {
         // expect(updatedEvent.linkedCustomJobsTagIds.length).toBe(eventsWithExistingTags.at(0).linkedCustomJobsTagIds.length)
         expect(updatedEvent.linkedCustomJobsTagIds).toStrictEqual(
            eventsWithExistingTags.at(0).linkedCustomJobsTagIds
         )
      })
   })
})

const getEventsByIds = (ids: string[]): Promise<LivestreamEvent[]> => {
   return Promise.resolve(allEvents.filter((e) => ids.includes(e.id)))
}
