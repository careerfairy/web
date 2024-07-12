import { Group } from "@careerfairy/shared-lib/groups"
import {
   LivestreamEvent,
   NUMBER_OF_MS_FROM_STREAM_START_TO_BE_CONSIDERED_PAST,
} from "@careerfairy/shared-lib/livestreams"
import { getBaseUrl } from "../components/helperFunctions/HelperFunctions"
import { DeviceOption } from "../types/streaming"

const getDeviceKindLabel = (deviceKind: MediaDeviceInfo["kind"]) => {
   if (deviceKind === "audioinput") return "microphone"
   if (deviceKind === "audiooutput") return "speaker"
   if (deviceKind === "videoinput") return "camera"
   return "unknown"
}
export const getDeviceKindListName = (deviceKind: MediaDeviceInfo["kind"]) => {
   if (deviceKind === "audioinput") return "audioInputList"
   if (deviceKind === "audiooutput") return "audioOutputList"
   if (deviceKind === "videoinput") return "videoDeviceList"
   return "unknownDeviceList"
}

export const getDeviceList = (
   deviceInfos: MediaDeviceInfo[],
   deviceKind: MediaDeviceInfo["kind"]
) => {
   return deviceInfos.reduce((acc, currDeviceInfo) => {
      if (
         currDeviceInfo.kind === deviceKind &&
         currDeviceInfo.deviceId !== "default"
      ) {
         const option = {
            value: currDeviceInfo.deviceId,
            text:
               currDeviceInfo.label ||
               `${getDeviceKindLabel(currDeviceInfo.kind)} ${
                  deviceInfos.length + 1
               }`,
         } as DeviceOption
         return acc.concat(option)
      } else {
         return acc
      }
   }, []) as DeviceOption[]
}
export const mapDevices = (deviceInfos: MediaDeviceInfo[]) => {
   const audioInputList = getDeviceList(deviceInfos, "audioinput")
   const audioOutputList = getDeviceList(deviceInfos, "audiooutput")
   const videoDeviceList = getDeviceList(deviceInfos, "videoinput")

   return {
      audioInputList: audioInputList,
      audioOutputList: audioOutputList,
      videoDeviceList: videoDeviceList,
   }
}

export const checkIfPast = (event: LivestreamEvent) => {
   const eventDate = event?.start?.toDate?.() || new Date(event?.startDate)

   return (
      event?.hasEnded ||
      eventDate <
         new Date(
            Date.now() - NUMBER_OF_MS_FROM_STREAM_START_TO_BE_CONSIDERED_PAST
         )
   )
}

// This function tries to find whom the event is hosted by from the fetched groups from the groupIds array field on the livestream document
export const getRelevantHosts = (
   // The most common scenario is a company group and a university group
   // In this scenario we will want to the users to register through the university group
   // by providing the university group ID the function will try and find the university in the group list
   // and register only through that university and not any other groups attached to the event
   targetHostGroupId: string,
   event: LivestreamEvent,
   // groups returned from fetching the group IDs array field on the livestream Document
   groupList: Group[]
) => {
   if (!event) return []
   let targetGroupId = targetHostGroupId
   if (!targetGroupId) {
      const listIsAllCompanies = groupList.every(
         (group) => !group.universityCode
      )
      if (!listIsAllCompanies) {
         const companyThatPublishedStream = groupList.find(
            (group) =>
               !group.universityCode && group.id === event?.author?.groupId
         )
         if (companyThatPublishedStream?.id) {
            targetGroupId = companyThatPublishedStream.id
         }
      }
   }
   const relevantHost = groupList.find((group) => group.id === targetGroupId)
   return relevantHost ? [relevantHost] : groupList
}

export const getLinkToStream = (
   event: LivestreamEvent,
   groupId: string,
   shouldAutoRegister?: boolean,
   asPath?: string
) => {
   const path =
      asPath || (groupId ? `/next-livestreams/${groupId}` : `/next-livestreams`)

   const url = new URL(path, getBaseUrl())

   url.searchParams.set("livestreamId", event.id)

   if (shouldAutoRegister) {
      url.searchParams.set("register", event.id)
   }

   return url.toString()
}

export const buildStreamerLink = (
   variant: "joining-streamer" | "main-streamer",
   livestreamId: string,
   secureToken: string
) => {
   return `${getBaseUrl()}/streaming/${livestreamId}/${variant}?token=${secureToken}`
}
