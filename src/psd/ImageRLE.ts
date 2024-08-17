import {Image} from "./Image";
import {Header} from "./Header";
import {StreamReader} from "./StreamReader";
import {StreamWriter} from "./StreamWriter";

export class ImageRLE extends Image {

  constructor() {
    super();
    this.channel = [];
  }

  parse(stream:StreamReader, header:Header) {
    let i:number;
    let channel:Array<any> = this.channel = [];
    let lineLength:Array<number> = [];
    let channelIndex:number;
    let lines:Array<any>;
    let width:number = header.columns;
    let height:number = header.rows;
    let channels:number = header.channels;
    let size:number;
    let pos:number;

    // line lengths
    for (i = 0; i < height * channels; ++i) {
      if(header.version === 2) {
        lineLength[i] = stream.readUint32();
      } else {
        lineLength[i] = stream.readUint16();
      }

    }

    // channel data
    for (channelIndex = 0; channelIndex < channels; ++channelIndex) {
      lines = [];
      size = width * height;

      channel[channelIndex] = new Uint8Array(size);
      // channel data
      for (i = 0; i < height; ++i) {
        stream.readPackBits(lineLength[channelIndex * height + i], channel[channelIndex], width*i);
      }
    }
  }

  write(stream:StreamWriter, header:Header) {
    
    let lineLength:Array<number> = [];
    let lines:Array<Uint8Array> = [];
    let height = header.rows;
    let width = header.columns;

    for(let j = 0; j < this.channel.length; j++) {
      let channel = this.channel[j];
      for(let i =0; i < height; i++) {
        let line = StreamWriter.createPackbits(channel.slice(i*width,i*width+width)) as Uint8Array;
        lines.push(line);
        lineLength.push(line.length);
      }
    }
    if(header.version === 2) {
      for(let i = 0; i < lineLength.length; i++) {
        stream.writeUint32(lineLength[i]);
      }
    } else {
      for(let i = 0; i < lineLength.length; i++) {
        stream.writeUint16(lineLength[i]);
      }
    }
    for(let i = 0; i < lines.length;i++) {
      stream.write(lines[i]);
    }
  }
}