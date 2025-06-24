import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import {
   JobsData,
   UserProfile,
} from "@careerfairy/shared-lib/customJobs/service/UserBasedRecommendationsBuilder"
import { PublicGroup } from "@careerfairy/shared-lib/groups/groups"
import { Logger } from "@careerfairy/shared-lib/utils/types"
import { Timestamp } from "../api/firestoreAdmin"
import { CustomJobRecommendationService } from "../lib/recommendation/CustomJobRecommendationService"

describe("CustomJobRecommendationService", () => {
   const mockLogger: Logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
   }

   // Minimal PublicGroup mock
   const group: PublicGroup = {
      id: "group1",
      description: "desc",
      bannerImageUrl: "",
      logoUrl: "",
      extraInfo: "",
      universityName: "",
      universityCode: "",
      publicSparks: false,
      publicProfile: false,
      careerPageUrl: "",
      targetedCountries: [],
      targetedUniversities: [],
      targetedFieldsOfStudy: [],
      plan: undefined,
      companyIndustries: [],
      companyCountry: undefined,
      companySize: "",
      featured: undefined,
   }

   // Helper to create a Firestore Timestamp
   const now = Timestamp.now()

   // Dummy jobs with different businessFunctionsTagIds
   const jobs: CustomJob[] = [
      {
         id: "job1",
         groupId: "group1",
         documentType: "customJobs",
         title: "Job 1",
         description: "desc",
         postingUrl: "",
         deadline: now,
         createdAt: now,
         updatedAt: now,
         livestreams: [],
         sparks: [],
         published: true,
         isPermanentlyExpired: false,
         group,
         businessFunctionsTagIds: ["tagA"],
      },
      {
         id: "job2",
         groupId: "group1",
         documentType: "customJobs",
         title: "Job 2",
         description: "desc",
         postingUrl: "",
         deadline: now,
         createdAt: now,
         updatedAt: now,
         livestreams: [],
         sparks: [],
         published: true,
         isPermanentlyExpired: false,
         group,
         businessFunctionsTagIds: ["tagB"],
      },
      {
         id: "job3",
         groupId: "group1",
         documentType: "customJobs",
         title: "Job 3",
         description: "desc",
         postingUrl: "",
         deadline: now,
         createdAt: now,
         updatedAt: now,
         livestreams: [],
         sparks: [],
         published: true,
         isPermanentlyExpired: false,
         group,
         businessFunctionsTagIds: ["tagA", "tagB"],
      },
   ]

   // User profile with businessFunctionsTagIds matching job1 and job3
   const userProfile: UserProfile = {
      userData: {
         id: "user1",
         authId: "user1",
         firstName: "Test",
         lastName: "User",
         university: { code: "", name: "" },
         linkedinUrl: "",
         userResume: "",
         backFills: [],
         universityCountryCode: "",
         userEmail: "",
         validationPin: 0,
         lastActivityAt: now,
         createdAt: now,
         businessFunctionsTagIds: ["tagA"],
      },
      jobApplications: [],
      registeredLivestreams: [],
      studyBackgrounds: [],
      followingCompanies: [],
      lastViewedJobs: [],
      savedJobs: [],
   }

   const jobsData: JobsData = {
      customJobs: jobs,
      referenceJob: null,
      stats: null,
   }

   it("returns jobs ordered by matching businessFunctionsTagIds", async () => {
      const service = new CustomJobRecommendationService(
         userProfile,
         jobsData,
         mockLogger
      )
      const result = await service.getRecommendations(3)
      // job3 has both tagA and tagB, job1 has tagA, job2 has tagB (user has tagA)
      // So job1 and job3 should come before job2, and job1 comes before job3 by id
      expect(result).toEqual(["job1", "job3", "job2"])
   })

   // More tests can be added here easily
})
