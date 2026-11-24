import { afterEach, describe, expect, it, vi } from 'vitest'
import { shareText } from './share.ts'

afterEach(() => vi.unstubAllGlobals())

describe('sharing a result', () => {
  it('passes the official address to the share sheet', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { share })
    expect(await shareText('Geschnatter 24.11.')).toBe('shared')
    expect(share).toHaveBeenCalledWith({ text: 'Geschnatter 24.11.', url: 'https://geschnatter.ganzgraz.at' })
  })

  it('copies text and address where there is no share sheet', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    expect(await shareText('Geschnatter 24.11.')).toBe('copied')
    expect(writeText).toHaveBeenCalledWith('Geschnatter 24.11.\nhttps://geschnatter.ganzgraz.at')
  })
})
