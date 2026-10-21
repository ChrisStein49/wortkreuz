// Shares a text through the phone's share sheet, or copies it where that
// isn't available (most desktop browsers).

export type ShareOutcome = 'shared' | 'copied' | 'cancelled'

export async function shareText(text: string): Promise<ShareOutcome> {
  try {
    if (navigator.share) {
      await navigator.share({ text })
      return 'shared'
    }
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    // share sheet dismissed or clipboard blocked
    return 'cancelled'
  }
}
