/**
 * The starting point of the application.
 *
 * @author Tiberius Gherac <tiberius.gherac@gmail.com>
 * @version 1.0.0
 */

import { Application } from './application.js'
import { sendErrorNotificationToDiscord } from './sendNotification.js'

const main = async () => {
  const hour = new Date().getHours()
  const startHour = parseInt(process.env.START_HOUR)
  const endHour = parseInt(process.env.END_HOUR)

  if (hour < startHour || hour >= endHour) {
    return
  }

  try {
    // Begin to run the actual application.
    const application = new Application(process.env.URL)
    await application.run()
  } catch (error) {
    await sendErrorNotificationToDiscord(error)
  }
}

const intervalMinutes = parseInt(process.env.CHECK_INTERVAL)

main()

// Call main again at interval
setInterval(main, intervalMinutes * 60 * 1000)

// Send notification about crashes
process.on('uncaughtException', async (error) => {
  await sendErrorNotificationToDiscord(
    new Error(`Uncaught Exception: ${error.message}`)
  )
  process.exit(1)
})

process.on('unhandledRejection', async (reason) => {
  await sendErrorNotificationToDiscord(
    new Error(`Unhandled Rejection: ${reason}`)
  )
  process.exit(1)
})
