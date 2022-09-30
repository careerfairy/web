import * as path from "path"

export default {
   rootFolder: path.join(__dirname, "../../../"),
   fieldAndLevelOfStudyMappingJsonPath:
      "./data/fieldAndLevelOfStudyMapping.json",
   exportedFieldAndLevelOfStudyMapping:
      "./data/exportedFieldAndLevelOfStudyMapping.csv",
   failedAdminMigrationsJsonPath: "./data/failedAdminMigrations.json",
}
