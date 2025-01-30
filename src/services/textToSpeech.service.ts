import { Core } from '@d/core';
import { EdgeSpeechTTS } from '@lobehub/tts';

import { Buffer } from 'buffer';
import fs from 'fs';

export class TTS {
  // Get the personality of the TTS character
  private core!: Core;

  // Initialize the EdgeSpeechTTS object for text-to-speech conversion
  private edgeSpeech: EdgeSpeechTTS;

  constructor(core: Core) {
    this.core = core;

    this.edgeSpeech = new EdgeSpeechTTS({ locale: this.core.voice.voice.slice(0, 5)});
  }

  /**
   * Converts the given text to speech and saves it as an MP3 file.
   * 
   * @param text - The text to be converted to speech.
   * @param author - The author of the text, used in the filename of the generated MP3.
   * @returns A Promise that resolves to true if the operation was successful, false otherwise.
   */
  public async speak(text: string, author: string): Promise<boolean> {

    try {
      // Convert text into TTS
      const speechBuffers: Promise<Response> = this.edgeSpeech.create({
        input: text,
        options: this.core.voice
      });

      // Build Buffer from TTS
      const mp3Buffer = Buffer.from(await (await speechBuffers).arrayBuffer());

      // Save Buffer into MP3
      const fileName = `./speech/${author}_${new Date().toISOString().replace(/\:/g, '-')}.mp3`;
      await fs.writeFileSync(fileName, mp3Buffer);

      // Return function state
      return true;
    } catch(err) {
      console.error(err);

      // Return function state
      return false;
    }
  }

}