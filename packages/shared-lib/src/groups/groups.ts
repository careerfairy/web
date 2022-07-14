import { Identifiable } from "../commonTypes"
import { UserData } from "../users"
import { FieldOfStudy, RootFieldOfStudyCategory } from "../fieldOfStudy"
import { LevelOfStudy, RootLevelOfStudyCategory } from "../levelOfStudy"

// CareerCenterData collection
export interface Group extends Identifiable {
   // required
   groupId: string
   description: string
   logoUrl: string
   adminEmails: string[]
   adminEmail?: string

   // optional
   categories: GroupCategory[]
   extraInfo?: string
   partnerGroupIds?: string[]
   rank?: number
   test?: boolean
   universityCode?: string
   universityId?: string
   universityName?: string
   hidePrivateEventsFromEmbed?: boolean
   privacyPolicyActive?: boolean
}

export interface GroupCategory extends Identifiable {
   name: string
   options: GroupOption[]
}

export interface GroupOption extends Identifiable {
   name: string
}

/*
 * A a category document found in a sub-collection called "customCategories"
 * of the Group Document
 * */
export interface CustomCategory extends Identifiable {
   name: string
   hidden?: boolean
   // This property is used to determine if the category is can or cant
   // be deleted, levelOfStudy and fieldOfStudy types should not be deleted
   // for the sake of pdf reporting.
   categoryType: "levelOfStudy" | "fieldOfStudy" | "custom"
   options: Record<CustomCategoryOption["id"], CustomCategoryOption>
}

/**
 * A university category option stored in an
 * array field of the UniversityCategory document
 * called "options".
 */
export interface CustomCategoryOption extends Identifiable {
   name: string
}

export interface GroupUserStatData {
   count: number
   optionName: string
   optionId: string
}

export interface PdfReportData {
   numberOfStudentsFromUniversity: number
   studentStats: any
   numberOfUniversityStudentsWithNoStats: number
   numberOfUniversityStudentsThatFollowingUniversity: number
   group: Group
}

/*
 * Returns the same options dictionary, but sorted
 * by the option name.
 * */
export const sortCustomCategoryOptionsByName = (
   customCategoryOptions: CustomCategory["options"]
): CustomCategory["options"] =>
   convertCategoryOptionsToSortedArray(customCategoryOptions).reduce(
      (accumulator, option) => {
         accumulator[option.id] = customCategoryOptions[option.id]
         return accumulator
      },
      {}
   )

export const convertCategoryOptionsToSortedArray = (
   optionsDict: CustomCategory["options"],
   sortProperty = "name"
): CustomCategoryOption[] => {
   if (!optionsDict) return []
   return Object.keys(optionsDict)
      .map((key) => optionsDict[key])
      .sort((a, b) => (a[sortProperty] > b[sortProperty] ? 1 : -1))
}

export interface DataType {
   names: string[]
   options: string[]
}

export interface PdfCategoryChartData {
   name: string
   mainCategoryName: string
   mainCategoryId: string
   subCategoryName: string
   subCategoryId: string
   mainCategoryOptions: PdfCategoryChartOption[]
}

export const getPdfCategoryChartData = (
   mainCategory: CustomCategory | RootFieldOfStudyCategory,
   subCategory: CustomCategory | RootLevelOfStudyCategory,
   users: UserData[]
): PdfCategoryChartData => {
   const mainCategoryOptions = convertCategoryOptionsToSortedArray(
      mainCategory.options
   )
   const subCategoryOptions = convertCategoryOptionsToSortedArray(
      subCategory.options
   )
   const mainCategoryOptionsData = mainCategoryOptions
      .map<PdfCategoryChartOption>((option) => {
         const mainOptionData = {
            name: option.name,
            count: 0,
            id: option.id,
         }
         const subCategoryOptionsData = subCategoryOptions
            .map<PdfCategoryChartSubOption>((subOption) => {
               const subOptionData = {
                  name: subOption.name,
                  count: 0,
                  id: option.id,
               }
               const usersWithOption = users.filter(
                  (user) =>
                     user.university &&
                     user.university.categories &&
                     user.university.categories[mainCategory.id] &&
                     user.university.categories[mainCategory.id]
                        .selectedOptionId === option.id &&
                     user.university.categories[subCategory.id] &&
                     user.university.categories[subCategory.id]
                        .selectedOptionId === subOption.id
               )
               subOptionData.count = usersWithOption.length
               mainOptionData.count += subOptionData.count
               return subOptionData
            })
            .sort((a, b) => (a.count > b.count ? -1 : 1))
         return {
            ...mainOptionData,
            subCategoryOptions: subCategoryOptionsData,
         }
      })
      .sort((a, b) => (a.count > b.count ? -1 : 1))
   return {
      name: mainCategory.name,
      mainCategoryName: mainCategory.name,
      mainCategoryId: mainCategory.id,
      subCategoryName: subCategory.name,
      subCategoryId: subCategory.id,
      mainCategoryOptions: mainCategoryOptionsData,
   }
}
export interface PdfCategoryChartOption extends CustomCategoryOption {
   count: number
   subCategoryOptions: PdfCategoryChartSubOption[]
}
export interface PdfCategoryChartSubOption extends CustomCategoryOption {
   count: number
}

const data: {
   severity: string
   names: string[]
   options: {
      "1a0bc880-1017-4bd0-9039-25b87a8d139a": {
         entries: number
         name: string
         subOptions: {
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               entries: number
               name: string
            }
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               entries: number
               name: string
            }
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               entries: number
               name: string
            }
         }
         id: string
      }
      "8d5ed9d8-a6fa-4ed3-8fff-04eb884fff7c": {
         entries: number
         name: string
         subOptions: {
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               entries: number
               name: string
            }
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               entries: number
               name: string
            }
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               entries: number
               name: string
            }
         }
         id: string
      }
      "7785eae4-f85f-4c3d-81c0-c3318ce0b6b0": {
         entries: number
         name: string
         subOptions: {
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               entries: number
               name: string
            }
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               entries: number
               name: string
            }
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               entries: number
               name: string
            }
         }
         id: string
      }
      "e03926be-795b-4f34-88c1-8b3462bb9d73": {
         entries: number
         name: string
         subOptions: {
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               entries: number
               name: string
            }
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               entries: number
               name: string
            }
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               entries: number
               name: string
            }
         }
         id: string
      }
      "edc45833-f9d4-48f0-9c5d-cf0e417713e6": {
         entries: number
         name: string
         subOptions: {
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               entries: number
               name: string
            }
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               entries: number
               name: string
            }
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               entries: number
               name: string
            }
         }
         id: string
      }
      "a2f2aded-80e0-429f-be7e-0f692a03b185": {
         entries: number
         name: string
         subOptions: {
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               entries: number
               name: string
            }
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               entries: number
               name: string
            }
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               entries: number
               name: string
            }
         }
         id: string
      }
      "f1b92627-9dc4-4227-b4f4-26ab36add09a": {
         entries: number
         name: string
         subOptions: {
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               entries: number
               name: string
            }
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               entries: number
               name: string
            }
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               entries: number
               name: string
            }
         }
         id: string
      }
      "d46e8d06-301d-49f2-8838-ba039d64539c": {
         entries: number
         name: string
         subOptions: {
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               entries: number
               name: string
            }
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               entries: number
               name: string
            }
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               entries: number
               name: string
            }
         }
         id: string
      }
      "d8436d5a-d2ac-4fef-b904-2d8d0cc1d616": {
         entries: number
         name: string
         subOptions: {
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               entries: number
               name: string
            }
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               entries: number
               name: string
            }
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               entries: number
               name: string
            }
         }
         id: string
      }
      "023c0339-95b0-45ca-b41a-91e83fc0a5a9": {
         entries: number
         name: string
         subOptions: {
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               entries: number
               name: string
            }
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               entries: number
               name: string
            }
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               entries: number
               name: string
            }
         }
         id: string
      }
      "cebac61e-901b-42c1-8181-77a06f89f782": {
         entries: number
         name: string
         subOptions: {
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               entries: number
               name: string
            }
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               entries: number
               name: string
            }
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               entries: number
               name: string
            }
         }
         id: string
      }
      "580b91a2-0bf1-468d-834e-832d628b74fb": {
         entries: number
         name: string
         subOptions: {
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               entries: number
               name: string
            }
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               entries: number
               name: string
            }
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               entries: number
               name: string
            }
         }
         id: string
      }
      "de426c10-7b14-4909-8569-8cdbb3e02929": {
         entries: number
         name: string
         subOptions: {
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               entries: number
               name: string
            }
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               entries: number
               name: string
            }
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               entries: number
               name: string
            }
         }
         id: string
      }
      "f32cceec-7296-411c-8359-bc693d9a8ff7": {
         entries: number
         name: string
         subOptions: {
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               entries: number
               name: string
            }
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               entries: number
               name: string
            }
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               entries: number
               name: string
            }
         }
         id: string
      }
      "f07fe47a-e3cd-42ef-a941-4b4cb2545eff": {
         entries: number
         name: string
         subOptions: {
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               entries: number
               name: string
            }
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               entries: number
               name: string
            }
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               entries: number
               name: string
            }
         }
         id: string
      }
      "d2911e46-0c59-49ec-9b09-77928c505158": {
         entries: number
         name: string
         subOptions: {
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               entries: number
               name: string
            }
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               entries: number
               name: string
            }
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               entries: number
               name: string
            }
         }
         id: string
      }
      "44c432e1-0a5b-4499-8ed6-bbfbe9770f88": {
         entries: number
         name: string
         subOptions: {
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               entries: number
               name: string
            }
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               entries: number
               name: string
            }
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               entries: number
               name: string
            }
         }
         id: string
      }
      "ab8f62b8-1bf3-43fa-be06-f93a92c5dc3d": {
         entries: number
         name: string
         subOptions: {
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               entries: number
               name: string
            }
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               entries: number
               name: string
            }
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               entries: number
               name: string
            }
         }
         id: string
      }
      "856d3975-911b-4b5b-b825-f4948cfde1f5": {
         entries: number
         name: string
         subOptions: {
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               entries: number
               name: string
            }
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               entries: number
               name: string
            }
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               entries: number
               name: string
            }
         }
         id: string
      }
      "eb1f072b-9d38-4de4-88ae-bbc5f03e791e": {
         entries: number
         name: string
         subOptions: {
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               entries: number
               name: string
            }
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               entries: number
               name: string
            }
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               entries: number
               name: string
            }
         }
         id: string
      }
      "60c40bce-e07b-47f6-bf25-404f1ca31aa2": {
         entries: number
         name: string
         subOptions: {
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               entries: number
               name: string
            }
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               entries: number
               name: string
            }
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               entries: number
               name: string
            }
         }
         id: string
      }
      "d108ebf5-6167-4845-9a1e-554769a0655f": {
         entries: number
         name: string
         subOptions: {
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               entries: number
               name: string
            }
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               entries: number
               name: string
            }
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               entries: number
               name: string
            }
         }
         id: string
      }
      "f3343d16-1b98-44ca-acae-c6a9bdab82a2": {
         entries: number
         name: string
         subOptions: {
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               entries: number
               name: string
            }
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               entries: number
               name: string
            }
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               entries: number
               name: string
            }
         }
         id: string
      }
      "22f74440-96c9-4e70-b0b4-904cff803ea4": {
         entries: number
         name: string
         subOptions: {
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               entries: number
               name: string
            }
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               entries: number
               name: string
            }
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               entries: number
               name: string
            }
         }
         id: string
      }
   }
   id: string
   type: string
   message: string
} = {
   type: "specialized",
   id: "7022a7dc-9577-4aae-b5c0-6ccf88969dff",
   options: {
      "eb1f072b-9d38-4de4-88ae-bbc5f03e791e": {
         name: "Architecture",
         id: "c0b13e55-0b74-43c2-bc45-35443db8415e",
         entries: 0,
         subOptions: {
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               name: "Bachelor",
               entries: 0,
            },
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               name: "Master",
               entries: 0,
            },
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               name: "PhD",
               entries: 0,
            },
         },
      },
      "580b91a2-0bf1-468d-834e-832d628b74fb": {
         name: "Chemical Engineering and Biotechnology",
         id: "c0b13e55-0b74-43c2-bc45-35443db8415e",
         entries: 2,
         subOptions: {
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               name: "Bachelor",
               entries: 0,
            },
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               name: "Master",
               entries: 0,
            },
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               name: "PhD",
               entries: 2,
            },
         },
      },
      "22f74440-96c9-4e70-b0b4-904cff803ea4": {
         name: "Civil Engineering",
         id: "c0b13e55-0b74-43c2-bc45-35443db8415e",
         entries: 0,
         subOptions: {
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               name: "Bachelor",
               entries: 0,
            },
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               name: "Master",
               entries: 0,
            },
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               name: "PhD",
               entries: 0,
            },
         },
      },
      "44c432e1-0a5b-4499-8ed6-bbfbe9770f88": {
         name: "Communication Systems",
         id: "c0b13e55-0b74-43c2-bc45-35443db8415e",
         entries: 0,
         subOptions: {
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               name: "Bachelor",
               entries: 0,
            },
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               name: "Master",
               entries: 0,
            },
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               name: "PhD",
               entries: 0,
            },
         },
      },
      "d108ebf5-6167-4845-9a1e-554769a0655f": {
         name: "Computational Science and Engineering",
         id: "c0b13e55-0b74-43c2-bc45-35443db8415e",
         entries: 0,
         subOptions: {
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               name: "Bachelor",
               entries: 0,
            },
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               name: "Master",
               entries: 0,
            },
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               name: "PhD",
               entries: 0,
            },
         },
      },
      "856d3975-911b-4b5b-b825-f4948cfde1f5": {
         name: "Computer Science",
         id: "c0b13e55-0b74-43c2-bc45-35443db8415e",
         entries: 2,
         subOptions: {
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               name: "Bachelor",
               entries: 0,
            },
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               name: "Master",
               entries: 1,
            },
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               name: "PhD",
               entries: 1,
            },
         },
      },
      "7785eae4-f85f-4c3d-81c0-c3318ce0b6b0": {
         name: "Cyber Security",
         id: "c0b13e55-0b74-43c2-bc45-35443db8415e",
         entries: 0,
         subOptions: {
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               name: "Bachelor",
               entries: 0,
            },
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               name: "Master",
               entries: 0,
            },
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               name: "PhD",
               entries: 0,
            },
         },
      },
      "ab8f62b8-1bf3-43fa-be06-f93a92c5dc3d": {
         name: "Data Science",
         id: "c0b13e55-0b74-43c2-bc45-35443db8415e",
         entries: 0,
         subOptions: {
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               name: "Bachelor",
               entries: 0,
            },
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               name: "Master",
               entries: 0,
            },
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               name: "PhD",
               entries: 0,
            },
         },
      },
      "e03926be-795b-4f34-88c1-8b3462bb9d73": {
         name: "Digital Humanities",
         id: "c0b13e55-0b74-43c2-bc45-35443db8415e",
         entries: 0,
         subOptions: {
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               name: "Bachelor",
               entries: 0,
            },
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               name: "Master",
               entries: 0,
            },
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               name: "PhD",
               entries: 0,
            },
         },
      },
      "de426c10-7b14-4909-8569-8cdbb3e02929": {
         name: "Electrical and Electronic Engineering",
         id: "c0b13e55-0b74-43c2-bc45-35443db8415e",
         entries: 0,
         subOptions: {
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               name: "Bachelor",
               entries: 0,
            },
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               name: "Master",
               entries: 0,
            },
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               name: "PhD",
               entries: 0,
            },
         },
      },
      "cebac61e-901b-42c1-8181-77a06f89f782": {
         name: "Energy Science and Technology",
         id: "c0b13e55-0b74-43c2-bc45-35443db8415e",
         entries: 0,
         subOptions: {
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               name: "Bachelor",
               entries: 0,
            },
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               name: "Master",
               entries: 0,
            },
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               name: "PhD",
               entries: 0,
            },
         },
      },
      "1a0bc880-1017-4bd0-9039-25b87a8d139a": {
         name: "Environmental Sciences and Engineering",
         id: "c0b13e55-0b74-43c2-bc45-35443db8415e",
         entries: 0,
         subOptions: {
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               name: "Bachelor",
               entries: 0,
            },
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               name: "Master",
               entries: 0,
            },
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               name: "PhD",
               entries: 0,
            },
         },
      },
      "edc45833-f9d4-48f0-9c5d-cf0e417713e6": {
         name: "Financial Engineering",
         id: "c0b13e55-0b74-43c2-bc45-35443db8415e",
         entries: 1,
         subOptions: {
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               name: "Bachelor",
               entries: 0,
            },
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               name: "Master",
               entries: 1,
            },
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               name: "PhD",
               entries: 0,
            },
         },
      },
      "d8436d5a-d2ac-4fef-b904-2d8d0cc1d616": {
         name: "Life Sciences Engineering",
         id: "c0b13e55-0b74-43c2-bc45-35443db8415e",
         entries: 4,
         subOptions: {
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               name: "Bachelor",
               entries: 0,
            },
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               name: "Master",
               entries: 1,
            },
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               name: "PhD",
               entries: 3,
            },
         },
      },
      "f1b92627-9dc4-4227-b4f4-26ab36add09a": {
         name: "Applied Mathematics",
         id: "c0b13e55-0b74-43c2-bc45-35443db8415e",
         entries: 0,
         subOptions: {
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               name: "Bachelor",
               entries: 0,
            },
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               name: "Master",
               entries: 0,
            },
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               name: "PhD",
               entries: 0,
            },
         },
      },
      "8d5ed9d8-a6fa-4ed3-8fff-04eb884fff7c": {
         name: "Mathematics",
         id: "c0b13e55-0b74-43c2-bc45-35443db8415e",
         entries: 1,
         subOptions: {
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               name: "Bachelor",
               entries: 0,
            },
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               name: "Master",
               entries: 1,
            },
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               name: "PhD",
               entries: 0,
            },
         },
      },
      "f3343d16-1b98-44ca-acae-c6a9bdab82a2": {
         name: "Materials Sciences and Engineering",
         id: "c0b13e55-0b74-43c2-bc45-35443db8415e",
         entries: 1,
         subOptions: {
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               name: "Bachelor",
               entries: 0,
            },
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               name: "Master",
               entries: 0,
            },
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               name: "PhD",
               entries: 1,
            },
         },
      },
      "a2f2aded-80e0-429f-be7e-0f692a03b185": {
         name: "Mechanical Engineering",
         id: "c0b13e55-0b74-43c2-bc45-35443db8415e",
         entries: 8,
         subOptions: {
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               name: "Bachelor",
               entries: 4,
            },
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               name: "Master",
               entries: 4,
            },
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               name: "PhD",
               entries: 0,
            },
         },
      },
      "d46e8d06-301d-49f2-8838-ba039d64539c": {
         name: "Management, Technology and Entrepreneurship",
         id: "c0b13e55-0b74-43c2-bc45-35443db8415e",
         entries: 1,
         subOptions: {
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               name: "Bachelor",
               entries: 0,
            },
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               name: "Master",
               entries: 0,
            },
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               name: "PhD",
               entries: 1,
            },
         },
      },
      "f32cceec-7296-411c-8359-bc693d9a8ff7": {
         name: "Microengineering",
         id: "c0b13e55-0b74-43c2-bc45-35443db8415e",
         entries: 3,
         subOptions: {
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               name: "Bachelor",
               entries: 3,
            },
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               name: "Master",
               entries: 0,
            },
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               name: "PhD",
               entries: 0,
            },
         },
      },
      "60c40bce-e07b-47f6-bf25-404f1ca31aa2": {
         name: "Molecular Biology and Biological Chemistry",
         id: "c0b13e55-0b74-43c2-bc45-35443db8415e",
         entries: 1,
         subOptions: {
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               name: "Bachelor",
               entries: 0,
            },
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               name: "Master",
               entries: 0,
            },
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               name: "PhD",
               entries: 1,
            },
         },
      },
      "f07fe47a-e3cd-42ef-a941-4b4cb2545eff": {
         name: "Nuclear Engineering",
         id: "c0b13e55-0b74-43c2-bc45-35443db8415e",
         entries: 0,
         subOptions: {
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               name: "Bachelor",
               entries: 0,
            },
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               name: "Master",
               entries: 0,
            },
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               name: "PhD",
               entries: 0,
            },
         },
      },
      "d2911e46-0c59-49ec-9b09-77928c505158": {
         name: "Physics and applied Physics",
         id: "c0b13e55-0b74-43c2-bc45-35443db8415e",
         entries: 5,
         subOptions: {
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               name: "Bachelor",
               entries: 1,
            },
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               name: "Master",
               entries: 0,
            },
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               name: "PhD",
               entries: 4,
            },
         },
      },
      "023c0339-95b0-45ca-b41a-91e83fc0a5a9": {
         name: "Robotics",
         id: "c0b13e55-0b74-43c2-bc45-35443db8415e",
         entries: 2,
         subOptions: {
            "4984357d-bed5-4591-857c-4b8861f48bf2": {
               name: "Bachelor",
               entries: 0,
            },
            "975c4f4d-52bd-413b-9bf4-7e322bfa531a": {
               name: "Master",
               entries: 2,
            },
            "617edf8f-f8c0-43f8-b5c6-98baee7882e6": {
               name: "PhD",
               entries: 0,
            },
         },
      },
   },
   names: ["Bachelor", "Master", "PhD"],
   severity: "INFO",
   message: "-> studentStats",
}

export const create2DMappingFromUsers = (data) => {}
