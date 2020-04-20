const getters = {
  openID: state => state.user.openID,
  userInfo: state => state.user.userInfo,
  series: state => state.cards.series,
  decksName: state => state.cards.decksName,
  collectedDecks: state => state.cards.collectedDecks,
  archetypeList: state => state.cards.archetypeList,
  noticeContent: state => state.cards.noticeContent,
  deckTabFilter: state => state.cards.deckTabFilter,
  cardsPageParams: state => state.cards.cardsPageParams,
  entourageParams: state => state.cards.entourageParams,
  navHeight: state => state.settings.navHeight,
  tabHeight: state => state.settings.tabHeight,
  barHeight: state => state.settings.barHeight,
  isIphoneX: state => state.settings.isIphoneX,
  winWidth: state => state.settings.winWidth,
  winHeight: state => state.settings.winHeight,
  showBubble: state => state.settings.showBubble,
  adsOpenFlag: state => state.settings.adsOpenFlag,
  fbiVersion: state => state.settings.fbiVersion,
  fbiKey: state => state.settings.fbiKey,
  fbiFlag: state => state.settings.fbiFlag,
  card_resource: state => state.settings.card_resource,
  ifanr_arena_card_resource: state => state.settings.ifanr_arena_card_resource,
  arenaTableID: state => state.settings.arenaTableID,
  adNotice:state => state.settings.adNotice,
  compareDeck1: state => state.compare.compareDeck1,
  compareDeck2: state => state.compare.compareDeck2
}

export default getters
