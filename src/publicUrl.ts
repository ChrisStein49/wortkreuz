/**
 * Official address of Geschnatter. Fixed rather than window.location.origin
 * so shared results and newsletter links always point here, even when the
 * game is opened via the test site (wortkreuz.netlify.app) – as Go Goose does
 * with spiel.ganzgraz.at. Links already sent keep their address, so change
 * this only together with a redirect from the old address.
 */
export const PUBLIC_URL = 'https://geschnatter.ganzgraz.at'
