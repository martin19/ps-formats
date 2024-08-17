import {ChannelImage} from "./ChannelImage";
import {StreamReader} from "./StreamReader";
import {LayerRecord, LayerRecordInfo} from "./LayerRecord";
import {StreamWriter} from "./StreamWriter";
import {CompressionMethod} from "./EnumCompressionMethod";
import {Header} from "./Header";

export enum ChannelId {
  RealUserSuppliedMask = -3,
  UserSuppliedMask = -2,
  TransparencyMask = -1,
  Red = 0,
  Green = 1,
  Blue = 2,
}

export class ChannelRLE extends ChannelImage {
  constructor() {
    super();
    this.channel = new Uint8Array(0);
  }

  parse(stream:StreamReader, header:Header, layerRecord:LayerRecord, layerRecordInfo:LayerRecordInfo, length:number) {
    let i:number;
    let lineLength:Array<number> = [];

    let height:number;
    let width:number;
    const lmd = layerRecord.layerMaskData;
    if(layerRecordInfo.id == ChannelId.UserSuppliedMask) {
      if(lmd.bottom === null || lmd.top === null || lmd.right === null || lmd.left === null)
        throw new Error("UserSuppliedMask found but bounding box not available in lmd");
      height = lmd.bottom - lmd.top;
      width = lmd.right - lmd.left;
    } else if(layerRecordInfo.id == ChannelId.RealUserSuppliedMask) {
      if(lmd.realBottom === null || lmd.realTop === null || lmd.realRight === null || lmd.realLeft === null)
        throw new Error("RealUserSuppliedMask found but bounding box not available in lmd");
      height = lmd.realBottom - lmd.realTop;
      width = lmd.realRight - lmd.realLeft;
    } else {
      height = layerRecord.bottom - layerRecord.top;
      width = layerRecord.right - layerRecord.left;
    }

    let limit:number = stream.tell() + length;

    // line lengths
    if(header.version === 2) {
      for (i = 0; i < height; ++i) {
        lineLength[i] = stream.readUint32();
      }
    } else {
      for (i = 0; i < height; ++i) {
        lineLength[i] = stream.readUint16();
      }
    }

    this.channel = new Uint8Array(width * height);

    // channel data
    for (i = 0; i < height; ++i) {
      stream.readPackBits(lineLength[i], this.channel, width*i);
      // TODO: avoid invalid height
      if (stream.tell() >= limit) {
        break;
      }
    }
  }

  write(stream:StreamWriter, width : number, height : number) {
    let lineLength:number[] = [];
    let lines:Uint8Array[] = [];
    for(let i =0; i < height; i++) {
      let line = StreamWriter.createPackbits(this.channel.slice(i*width,i*width+width));
      if(line) {
        lines.push(line);
        lineLength.push(line.length);
      }
    }

    let ipDataStart = stream.tell();

    stream.writeUint16(CompressionMethod.RLE);

    for(let i = 0; i < lineLength.length; i++) {
      stream.writeUint16(lineLength[i]);
    }
    for(let i = 0; i < lines.length;i++) {
      stream.write(lines[i]);
    }

    let ipDataEnd = stream.tell();
    return ipDataEnd - ipDataStart;
  }
}
