// all known discord events. used mostly for debug purposes.
// see the EVENTS propery here:
//  https://discord.js.org/#/docs/main/stable/class/Client

// this is used in boot.ts to log event firing
export const all_events = [
  `applicationCommandCreate`,
  `applicationCommandDelete`,
  `applicationCommandUpdate`,
  `channelCreate`,
  `channelDelete`,
  `channelPinsUpdate`,
  `channelUpdate`,
  `debug`,
  `warn`,
  `emojiCreate`,
  `emojiDelete`,
  `emojiUpdate`,
  `error`,
  `guildBanAdd`,
  `guildBanRemove`,
  `guildCreate`,
  `guildDelete`,
  `guildUnavailable`,
  `guildIntegrationsUpdate`,
  `guildMemberAdd`,
  `guildMemberAvailable`,
  `guildMemberRemove`,
  `guildMembersChunk`,
  `guildMemberUpdate`,
  `guildUpdate`,
  `inviteCreate`,
  `inviteDelete`,
  // `message`,	// deprecated
  `messageCreate`,
  `messageDelete`,
  `messageReactionRemoveAll`,
  `messageReactionRemoveEmoji`,
  `messageDeleteBulk`,
  `messageReactionAdd`,
  `messageReactionRemove`,
  `messageUpdate`,
  `presenceUpdate`,
  `rateLimit`,
  `invalidRequestWarning`,
  `ready`,
  `invalidated`,
  `roleCreate`,
  `roleDelete`,
  `roleUpdate`,
  `threadCreate`,
  `threadDelete`,
  `threadListSync`,
  `threadMemberUpdate`,
  `threadMembersUpdate`,
  `threadUpdate`,
  `typingStart`,
  `userUpdate`,
  `voiceStateUpdate`,
  `webhookUpdate`,
  `interaction`,
  `interactionCreate`,
  `shardDisconnect`,
  `shardError`,
  `shardReady`,
  `shardReconnecting`,
  `shardResume`,
  `stageInstanceCreate`,
  `stageInstanceUpdate`,
  `stageInstanceDelete`,
  `stickerCreate`,
  `stickerDelete`,
  `stickerUpdate`,
];
