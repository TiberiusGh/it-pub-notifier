export async function sendPubNotificationToDiscord(newItPubs) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) {
    console.error('Discord webhook URL not configured')
    return
  }

  for (const pub of newItPubs) {
    const message = {
      embeds: [
        {
          title: '🍺 New IT-Pub Found!',
          description: pub.title,
          fields: [
            {
              name: 'Date & Time',
              value: `${pub.dateTime} ${pub.time}`,
              inline: true
            },
            { name: 'Location', value: pub.address || 'TBA', inline: true },
            {
              name: 'Link',
              value: pub.link || 'No link available',
              inline: false
            }
          ],
          color: 0x00ff00,
          timestamp: new Date().toISOString()
        }
      ]
    }

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      })
    } catch (error) {
      console.error('Failed to send Discord notification:', error.message)
    }
  }
}

export async function sendErrorNotificationToDiscord(error) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  const message = {
    embeds: [
      {
        title: '❌ IT-Pub Scraper Error',
        description: error.message || 'Unknown error occurred',
        color: 0xff0000,
        timestamp: new Date().toISOString()
      }
    ]
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    })
  } catch (fetchError) {
    console.error('Failed to send error notification:', fetchError.message)
  }
}

export async function sendInformationNotificationToDiscord(
  message,
  title = 'ℹ️ IT-Pub Scraper Info'
) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL

  const discordMessage = {
    embeds: [
      {
        title: title,
        description: message,
        color: 0x0099ff,
        timestamp: new Date().toISOString()
      }
    ]
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordMessage)
    })
  } catch (error) {
    console.error('Failed to send info notification:', error.message)
  }
}
