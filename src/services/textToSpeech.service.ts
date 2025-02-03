import { Core } from "@d/core";
import { EdgeSpeechTTS } from "@lobehub/tts";

import { Buffer } from "buffer";
import { globSync, unlinkSync, writeFileSync } from "fs";

export class TTS {
  // Get the personality of the TTS character
  private core!: Core;

  // Initialize the EdgeSpeechTTS object for text-to-speech conversion
  private edgeSpeech: EdgeSpeechTTS;

  constructor(core: Core) {
    this.core = core;

    this.edgeSpeech = new EdgeSpeechTTS({
      locale: this.core.voice.voice.slice(0, 5),
    });
  }

  /**
   * Converts the given text to speech and saves it as an MP3 file.
   *
   * @param text - The text to be converted to speech.
   * @param author - The author of the text, used in the filename of the generated MP3.
   * @returns A Promise that resolves to true if the operation was successful, false otherwise.
   */
  public async speak(text: string, author: string): Promise<string> {
    try {
      // Convert text into TTS
      const speechBuffers: Promise<Response> = this.edgeSpeech.create({
        input: text,
        options: this.core.voice,
      });

      // Build Buffer from TTS
      const mp3Buffer = Buffer.from(await (await speechBuffers).arrayBuffer());

      // Get the files from the mp3 folder
      const speechFiles: string[] = await globSync("./public/assets/mp3/*.mp3");

      // If more than 30 files were found
      if (speechFiles.length > 30) {
        // Sort files by date in ascending order
        const sortedSpeechFiles = await speechFiles.sort((a, b) => {
          const aDate = new Date(a.split("_").slice(-1)[0].split(".")[0]);
          const bDate = new Date(b.split("_").slice(-1)[0].split(".")[0]);

          return aDate.getTime() < bDate.getTime() ? 1 : -1;
        });

        // Remove the 30 youngest files
        const filesToDelete: string[] = sortedSpeechFiles.slice(30);

        // Delete the files from the filesystem
        filesToDelete.map((file) => {
          unlinkSync(file);
        });
      }

      // Save Buffer into MP3
      const fileName = `./public/assets/mp3/${author}_${new Date()
        .toISOString()
        .replace(/\:/g, "-")}.mp3`;
      await writeFileSync(fileName, mp3Buffer);

      // Return function state
      return fileName;
    } catch (err) {
      console.error(err);

      // Return function state
      throw err;
    }
  }
}
