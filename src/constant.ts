export const IS_SERVER = typeof window === 'undefined'

export const WHITELIST_MINT_TIME = 1647694800000 // 2022/3/19 21:00+8

export const PUBLIC_MINT_TIME = 1647781200000 // 2022/3/20 21:00+8

export const WHITE_PAPER_LINK = 'https://docs.ottopia.app/ottopia/'

export const BUY_CLAM_LINK = 'https://app.1inch.io/#/137/classic/swap/USDC/CLAM'

export const DAO_LINK = 'https://discord.gg/hygVspKCBf'

export const TREASURY_LINK = '/treasury/pond'

export const DISCORD_LINK = 'https://discord.gg/otterclam'

export const TWITTER_LINK = 'https://twitter.com/otterclam'

export const OPENSEA_NFT_LINK = 'https://opensea.io/assets/matic/0x6e8a9cb6b1e73e9fce3fd3c68b5af9728f708eb7/'

export function getOpenSeaLink(tokenId: string) {
  return `${OPENSEA_NFT_LINK}${tokenId}`
}

export const ottoClick = IS_SERVER ? { play: () => {}, load: () => {} } : new Audio('https://ottopia.app/ottoclick.mp3')
ottoClick.load()

export const TOTAL_RARITY_REWARD = 10000

export enum Token {
  Clam = 'CLAM',
}

export const reserveOttoAmount = (chainId?: number) => (chainId === 137 ? 250 : 0)
