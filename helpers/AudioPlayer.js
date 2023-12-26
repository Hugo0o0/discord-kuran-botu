const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
} = require("@discordjs/voice");

module.exports = class AudioPlayer {
  constructor(interaction, data) {
    this.interaction = interaction;
    this.data = data;
    this.connection = this.joinVoiceChannel();
    this.player = this.createAudioPlayer();

    this.playAudio();
  }

  joinVoiceChannel() {
    return joinVoiceChannel({
      channelId: this.interaction.member.voice.channelId,
      guildId: this.interaction.guildId,
      adapterCreator: this.interaction.guild.voiceAdapterCreator,
    });
  }

  createAudioPlayer() {
    return createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
      },
    });
  }

  playAudio() {
    const resource = createAudioResource(this.data.data.audio.mp3, {
      inlineVolume: true,
      inputType: "mp3",
      metadata: {
        title: "Ayet",
        url: "https://acikkuran.com/",
      },
    });

    this.player.play(resource);
    this.connection.subscribe(this.player);
  }
};
