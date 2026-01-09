/**
 * Underlying computer wizardly that needs to be done for scraping the for IT-pubs
 *
 * @author Tiberius Gherac <tiberius.gherac@gmail.com>
 * @version 1.0.0
 */
import { writeFile, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import validator from 'validator'
import { JSDOM } from 'jsdom'
import { sendPubNotificationToDiscord } from './sendNotification.js'

export class Application {
  #url

  constructor(url) {
    if (!validator.isURL(url)) {
      throw new Error(`"${url}" is not a valid URL.`)
    }
    this.#url = url
  }

  // Executes the main application flow.
  async run() {
    try {
      const response = await this.fetchContent(this.#url)
      const responseText = await response.text()
      const currentItPubs = await this.checkForItPubs(responseText)

      // Load previously tracked IT-pubs
      const previousItPubs = await this.loadPreviousItPubs()

      // Find new IT-pubs
      const newItPubs = this.findNewItPubs(currentItPubs, previousItPubs)

      // Save current IT-pubs to disk for future comparison
      await this.writeToDiskActualItPubs(currentItPubs)

      // Send notification only for the new It-pubs
      if (newItPubs.length > 0) {
        await sendPubNotificationToDiscord(newItPubs)
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  async fetchContent(url) {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          process.env.USER_AGENT +
          // "Troll" data
          'Mozilla/4.04 [en] (Win95; I; VR-Ready; Mars-Optimized)',
        'X-Preferred-Encoding': 'stone-tablet, papyrus, quantum-compression',
        'X-Timezone': 'Mars',
        'X-Screen-Resolution': '3000x400@244Hz-HDR-Quantum',
        'X-Input-Methods': 'Mind-Control, Telekinesis'
      }
    })

    if (!response.ok) {
      throw new Error(
        'Failed to fetch the content of the website in fetchContent().'
      )
    }

    return response
  }

  async checkForItPubs(responseText) {
    const dom = new JSDOM(responseText)

    // Filter for events containing "IT-pub" in title or description
    const itPubEvents = [
      ...dom.window.document.querySelectorAll('.events-item')
    ].filter((event) => {
      const title =
        event.querySelector('.events-item__title')?.textContent || ''
      const excerpt =
        event.querySelector('.events-item__excerpt')?.textContent || ''

      const searchTerm = 'it-pub'

      return (
        title.toLowerCase().includes(searchTerm) ||
        excerpt.toLowerCase().includes(searchTerm)
      )
    })

    // Extract meaningful data from DOM elements
    return itPubEvents.map((event) => {
      const title =
        event.querySelector('.events-item__title')?.textContent?.trim() || ''
      const excerpt =
        event.querySelector('.events-item__excerpt')?.textContent?.trim() || ''
      const link = event.querySelector('.events-item__link')?.href || ''
      const dateTime =
        event
          .querySelector('.events-item__date time')
          ?.getAttribute('datetime') || ''
      const time =
        event.querySelector('.events-item__footer time')?.textContent?.trim() ||
        ''
      const address =
        event
          .querySelector('.events-item__footer [itemprop="address"]')
          ?.textContent?.trim() || ''

      return {
        title,
        excerpt,
        link,
        dateTime,
        time,
        address,
        // Create a unique identifier for comparison
        id: this.createEventId(title, dateTime, link)
      }
    })
  }

  createEventId(title, dateTime, link) {
    // Use a combination of title, date, and link to create unique ID
    const combined = `${title}-${dateTime}-${link}`
    // Simple hash
    return Buffer.from(combined).toString('base64')
  }

  async loadPreviousItPubs() {
    try {
      if (!existsSync('./data/it-pubs.json')) {
        return []
      }

      const data = await readFile('./data/it-pubs.json', 'utf8')

      // If file is empty or whitespace only, return empty array
      if (!data || data.trim() === '') {
        return []
      }

      return JSON.parse(data)
    } catch (error) {
      // If JSON parsing fails, return empty array instead of crashing
      console.error('Error loading previous IT-pubs:', error.message)
      return []
    }
  }

  findNewItPubs(currentItPubs, previousItPubs) {
    const previusIds = new Set(previousItPubs.map((pub) => pub.id))
    return currentItPubs.filter((pub) => !previusIds.has(pub.id))
  }

  async writeToDiskActualItPubs(data) {
    try {
      await writeFile('./data/it-pubs.json', JSON.stringify(data, null, 2))
    } catch (error) {
      throw new Error(error)
    }
  }
}
