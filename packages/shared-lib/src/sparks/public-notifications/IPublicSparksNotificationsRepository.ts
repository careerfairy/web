import { UserSparksNotification } from "../../users/users"

export interface IPublicSparksNotificationsRepository {
   /**
    * Fetches all UserSparksNotifications
    * @returns {Promise<UserSparksNotification[] | []>} A promise that resolves to an array of UserSparksNotifications or an empty array
    */
   getAll(): Promise<UserSparksNotification[] | []>

   /**
    * Creates a new UserSparksNotification
    * @param {UserSparksNotification} notification - The notification to create
    * @returns {Promise<void>} A promise that resolves when the notification is created
    */
   create(notification: UserSparksNotification): Promise<void>

   /**
    * Deletes a UserSparksNotification
    * @param {string} id - The id of the notification to delete
    * @returns {Promise<void>} A promise that resolves when the notification is deleted
    */
   delete(id: string): Promise<void>

   /**
    * Updates a UserSparksNotification
    * @param {UserSparksNotification} notification - The notification to update
    * @returns {Promise<void>} A promise that resolves when the notification is updated
    */
   update(notification: UserSparksNotification): Promise<void>
}
