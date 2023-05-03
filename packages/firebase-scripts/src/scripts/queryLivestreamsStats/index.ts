import { Group } from "@careerfairy/shared-lib/dist/groups"
import {
   UserLivestreamData,
   LivestreamEvent,
} from "@careerfairy/shared-lib/dist/livestreams"
import { LiveStreamStats } from "@careerfairy/shared-lib/dist/livestreams/stats"
import { sourcesByDate } from "@careerfairy/shared-lib/dist/livestreams/sources/transformations"
import Counter from "../../lib/Counter"
import { logAction } from "../../util/logger"
import { groupRepo, livestreamRepo } from "../../repositories"
import ObjectsToCsv = require("objects-to-csv")

const counter = new Counter()

let livestreamStats: LiveStreamStats[] = []
let userLivestreamData: UserLivestreamData[] = []
let livestreams: LivestreamEvent[] = []
let groups: Group[] = []

type DataRow = {
   "Company Name": string
   "Stream Id": string
   "Stream Title": string
   Date: string
   Language: string
   "# Registrations": number
   "# Participations": number
   "# Social (Registrations)": number
   "# Platform (Registrations)": number
   "# University Network (Registrations)": number
   "How happy are you with the content shared by .. (1 - 5)": number
   "# of votes - How happy are you ..": number
   "Are you more likely to apply (1 - 5)": number
   "# of votes - Are you more likely to apply": number
}

const results: DataRow[] = []

export async function run() {
   try {
      Counter.log("Fetching data")
      ;[livestreamStats, userLivestreamData, groups, livestreams] =
         await logAction(
            () =>
               Promise.all([
                  livestreamRepo.getAllLivestreamStats(),
                  livestreamRepo.getAllUserLivestreamData(false),
                  groupRepo.getAllGroups(),
                  livestreamRepo.getAllLivestreams(),
               ]),
            "Fetching users, userLivestreamData, livestreams and recordingStats"
         )

      counter.addToReadCount(
         livestreamStats.length +
            userLivestreamData.length +
            groups.length +
            livestreams.length
      )

      process()

      const csv = new ObjectsToCsv(results)

      await csv.toDisk(
         `./queryLivestreams - ${new Date().getMilliseconds()}.csv`
      )

      console.log(`-> Done! CVSs saved at packages\\firebase-scripts`)
   } catch (error) {
      console.error(error)
   } finally {
      counter.print()
   }
}

function process() {
   for (const stream of livestreams) {
      try {
         const streamUsers = getUserLivestreamData(stream.id)
         const registrations = getRegistrations(streamUsers)
         const [social, platform, network] =
            getTotalRegistrationsByUTMs(registrations)

         const stat = getStat(stream.id)

         if (!stat) {
            console.error(`Stream ${stream.id} has no livestream stats!`)
         }

         const row: DataRow = {
            "Company Name": getGroups(stream.groupIds),
            "Stream Id": stream.id,
            "Stream Title": stream.title,
            Date: stream.start?.toDate?.()?.toISOString() ?? "",
            Language: stream.language?.code ?? "",
            "# Registrations": registrations.length,
            "# Participations": getTotalParticipations(streamUsers),
            "# Social (Registrations)": social,
            "# Platform (Registrations)": platform,
            "# University Network (Registrations)": network,
            "How happy are you with the content shared by .. (1 - 5)":
               stat?.ratings?.company?.averageRating ?? 0,
            "# of votes - How happy are you ..":
               stat?.ratings?.company?.numberOfRatings ?? 0,
            "Are you more likely to apply (1 - 5)":
               stat?.ratings?.willApply?.averageRating ?? 0,
            "# of votes - Are you more likely to apply":
               stat?.ratings?.willApply?.numberOfRatings ?? 0,
         }

         results.push(row)
      } catch (error) {
         console.error(error, stream.id)
      }
   }

   console.log(`Total rows: ${results.length}`)
}

function getGroups(groupsIs: string[]) {
   if (!groupsIs) return ""
   return groups
      .filter((g) => groupsIs.includes(g.id))
      .map((g) => g.universityName)
      .join(", ")
}

function getStat(livestreamId: string) {
   return livestreamStats.filter((s) => s.livestream.id === livestreamId)[0]
}

function getUserLivestreamData(livestreamId: string): UserLivestreamData[] {
   return userLivestreamData.filter((d) => d.livestreamId === livestreamId)
}

function getRegistrations(data: UserLivestreamData[]) {
   return data.filter((d) => d.registered)
}

function getTotalParticipations(data: UserLivestreamData[]): number {
   return data.filter((d) => d.participated).length
}

function getTotalRegistrationsByUTMs(registrations: UserLivestreamData[]) {
   const sources = sourcesByDate(
      registrations.map((r) => ({
         livestreamId: r.livestreamId,
         registered: {
            date: r.registered?.date?.toDate(),
            utm: r.registered?.utm,
         },
      }))
   )

   const social =
      sources.filter((s) => s.source.displayName === "Social")[0]?.dates
         ?.length ?? 0
   const platform =
      sources.filter(
         (s) => s.source.displayName === "Platform Registrations"
      )[0]?.dates?.length ?? 0
   const network =
      sources.filter(
         (s) => s.source.displayName === "University Network Promo"
      )[0]?.dates?.length ?? 0

   return [social, platform, network]
}
