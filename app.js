const DiscordRPC = require('discord-rpc'),
      log = require("fancy-log"),
      fs = require('fs'),
      os = require("os");

const keys = require('./keys.json');

const rpc = new DiscordRPC.Client({ transport: keys.rpcTransportType }),
      appClient = keys.appClientID,
      largeImageKey = keys.imageKeys.large,
      smallImageKey = keys.imageKeys.small,
      smallImagePausedKey = keys.imageKeys.smallPaused;


async function readJSON() {
    if (os.platform == "darwin") {
      var obj = JSON.parse(require('fs').readFileSync(os.homedir() + '/Library/Application Support/Google Play Music Desktop Player/json_store/playback.json', 'utf8'));
    } else if (os.platform == "linux") {
      var obj = JSON.parse(require('fs').readFileSync(os.homedir() + '/.config/Google Play Music Desktop Player/json_store/playback.json', 'utf8'));
    } else if (os.platform == "win32") {
      var obj = JSON.parse(require('fs').readFileSync(os.homedir() + '\\AppData\\Roaming\\Google Play Music Desktop Player\\json_store\\playback.json', 'utf8'));
    }
    log.info("Playing: " + obj.song.title)
    if (obj.playing == false) {
      if (obj.song.title == null) {
        if (keys.transmitwhenidle == true) {
          rpc.setActivity({
            details: `User has not picked a song,`,
            state: ` or the app isn't open.`,
            largeImageKey,
            smallImagePausedKey,
            largeImageText: `Playcord by theLMGN`,
            smallImageText: `Nothing is playing.`,
            instance: false,
          });
        }
      } else {
        rpc.setActivity({
          details: `Paused: ${obj.song.title}`,
          state: `by  ${obj.song.artist}`,
          largeImageKey,
          smallImagePausedKey,
          largeImageText: `Playcord by theLMGN`,
          smallImageText: `💿  ${obj.song.album}`,
          instance: false,
        });
      }
      
    } else {
      rpc.setActivity({
        details: `Playing ${obj.song.title}`,
        state: `by  ${obj.song.artist}`,
        startTimestamp: Math.floor((new Date() - obj.time.current) / 1000),
        endTimestamp: Math.floor(((new Date() - obj.time.current) + obj.time.total) / 1000),
        largeImageKey,
        smallImageKey,
        largeImageText: `Playcord by theLMGN`,
        smallImageText: `💿  ${obj.song.album}`,
        instance: true,
      });
    }
    
}

rpc.on('ready', () => {
  log(`Connected to Discord! (${appClient})`);

  setInterval(() => {
    try {
      readJSON()
  } catch (e) {
      log.error(e);
  }
  }, 1500);
});

if (os.platform() === "win32" || os.platform() === "darwin" || os.platform() === "linux") {
  rpc.login(appClient).catch(log.error);
} else {
  log.error(`We don't support ${os.platform()} just yet.`)
}

