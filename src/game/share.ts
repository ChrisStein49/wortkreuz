// Shares a text through the phone's share sheet, or copies it where that
// isn't available (most desktop browsers). The game's official address goes
// along, so whoever receives the result can open the game (as in Go Goose).
import { PUBLIC_URL } from '../publicUrl.ts'

export type ShareOutcome = 'shared' | 'copied' | 'cancelled'

export async function shareText(text: string): Promise<ShareOutcome> {
  try {
    if (navigator.share) {
      await navigator.share({ text, url: PUBLIC_URL })
      return 'shared'
    }
    await navigator.clipboard.writeText(`${text}\n${PUBLIC_URL}`)
    return 'copied'
  } catch {
    // share sheet dismissed or clipboard blocked
    return 'cancelled'
  }
}
