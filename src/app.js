/**
 * The starting point of the application.
 *
 * @author Tiberius Gherac <tiberius.gherac@gmail.com>
 * @version 1.0.0
 */

import { Application } from './application.js'
import { sendErrorNotificationToDiscord } from './sendNotification.js'

const main = async () => {
  try {
    if (!process.env.URL) {
      throw new Error('Please enter a url in the .env file for URL variable')
    }

    // Begin to run the actual application.
    const application = new Application(process.env.URL)
    await application.run()
  } catch (error) {
    sendErrorNotificationToDiscord(error)
  }
}

main()
