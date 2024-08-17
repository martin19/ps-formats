import {ChannelImage} from "./ChannelImage";
import {StreamReader} from "./StreamReader";
import {LayerRecord, LayerRecordInfo} from "./LayerRecord";
import {Header} from "./Header";
import {ColorModeData} from "./ColorModeData";
import {ChannelId, ChannelRLE} from "./ChannelRLE";
import {ChannelRAW} from "./ChannelRAW";
import {Color} from "./Color";
import {StreamWriter} from "./StreamWriter";
//import {Layer} from "../../Layer/Layer";
import {LayerInfo} from "./LayerInfo";
import {Channels} from "../../Storage/StorageUtils";
import {AdditionalLayerInfo} from "./AdditionalLayerInfo";
import {CompressionMethod} from "./EnumCompressionMethod";
import {Buffer4} from "../../Storage/Buffer4";
import {Buffer1} from "../../Storage/Buffer1";

export class ChannelImageData {

  private _offset:number = 0;
  private _length:number = 0;

  channel:Array<ChannelImage>;

  constructor() {
    this.channel = [];
  }

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, header:Header, layerRecord:LayerRecord) {
    let channels:Array<ChannelImage> = this.channel = [];
    let channel:ChannelImage;
    let compressionMethod:CompressionMethod;
    let i:number;
    let il:number;
    let pos:number;
    let info:LayerRecordInfo;

    this._offset = stream.tell();

    for (i = 0, il = layerRecord.channels; i < il; ++i) {
      pos = stream.tell();
      info = layerRecord.channelInfo[i];

      compressionMethod = stream.readUint16();

      if (info.length === 2) {
        continue;
      }

      switch (compressionMethod) {
        case CompressionMethod.RAW:
          channel = new ChannelRAW();
          break;
        case CompressionMethod.RLE:
          channel = new ChannelRLE();
          break;
        default:
          throw new Error('unknown compression method: ' + compressionMethod);
      }
      channel.parse(stream, header, layerRecord, info, info.length - 2);

      channels[i] = channel;
      stream.seek(info.length + pos, 0);
    }

    this._length = stream.tell() - this._offset;
  };
  
  /**
   * Write image data and masks.
   * @param stream
   * @param imageData
   * @param layerRecord
   * @param userMaskData
   * @param realUserMaskData
   * @returns {null}
   */
  write(stream: StreamWriter, layerRecord:LayerRecord, imageData:Buffer4|null, userMaskData:Buffer1|null, realUserMaskData:Buffer1|null) {
    let channelA : ChannelRLE|null = null;
    let channelR : ChannelRLE|null = null;
    let channelG : ChannelRLE|null = null;
    let channelB : ChannelRLE|null = null;
    let channelMask : ChannelRLE|null = null;

    let channelInfo : LayerRecordInfo[] = layerRecord.channelInfo;

    let currentChannelIndex = 0;
    this.channel = [];

    if(userMaskData) {
      let widthMask = userMaskData.width;
      let heightMask = userMaskData.height;
      if(widthMask === 0 || heightMask === 0) {
        channelInfo[currentChannelIndex++] = { id : ChannelId.UserSuppliedMask, length : 2 };
      } else {
        let channelMask = new ChannelRLE();
        channelMask.channel = new Uint8Array(widthMask*heightMask);
        for(let i = 0; i < userMaskData.data.length; i++) {
          (channelMask.channel)[i] = userMaskData.data[i];
        }
        const length = channelMask.write(stream, userMaskData.width, userMaskData.height);
        channelInfo[currentChannelIndex++] = { id : ChannelId.UserSuppliedMask, length };
      }
    }

    if(realUserMaskData) {
      let widthMask = realUserMaskData.width;
      let heightMask = realUserMaskData.height;
      if(widthMask === 0 || heightMask === 0) {
        channelInfo[currentChannelIndex++] = { id : ChannelId.RealUserSuppliedMask, length : 2 };
      } else {
        let channelMask = new ChannelRLE();
        channelMask.channel = new Uint8Array(widthMask*heightMask);
        for(let i = 0; i < realUserMaskData.data.length; i++) {
          (channelMask.channel)[i] = realUserMaskData.data[i];
        }
        const length = channelMask.write(stream, realUserMaskData.width, realUserMaskData.height);
        channelInfo[currentChannelIndex++] = { id : ChannelId.RealUserSuppliedMask, length };
      }
    }

    if(imageData) {
      let widthImage = imageData.width;
      let heightImage = imageData.height;
      if(widthImage === 0 || heightImage === 0) {
        stream.writeUint16(CompressionMethod.RAW);
        stream.writeUint16(CompressionMethod.RAW);
        stream.writeUint16(CompressionMethod.RAW);
        stream.writeUint16(CompressionMethod.RAW);
        channelInfo[currentChannelIndex++] = { id : -1, length : 2 };
        channelInfo[currentChannelIndex++] = { id : 0, length : 2 };
        channelInfo[currentChannelIndex++] = { id : 1, length : 2 };
        channelInfo[currentChannelIndex++] = { id : 2, length : 2 };
      } else {
        channelA = new ChannelRLE();
        channelR = new ChannelRLE();
        channelG = new ChannelRLE();
        channelB = new ChannelRLE();
        channelA.channel = new Uint8Array(widthImage * heightImage);
        channelR.channel = new Uint8Array(widthImage * heightImage);
        channelG.channel = new Uint8Array(widthImage * heightImage);
        channelB.channel = new Uint8Array(widthImage * heightImage);

        let i = 0;
        for (let y = 0; y < heightImage; ++y) {
          for (let x = 0; x < widthImage; ++x) {
            let index = (y * widthImage + x);
            (channelA.channel)[i] = imageData.data[index * 4 + 3];
            (channelR.channel)[i] = imageData.data[index * 4];
            (channelG.channel)[i] = imageData.data[index * 4 + 1];
            (channelB.channel)[i] = imageData.data[index * 4 + 2];
            i++;
          }
        }

        let length = channelA.write(stream, imageData.width, imageData.height);
        channelInfo[currentChannelIndex++] = {id: -1, length};
        length = channelR.write(stream, imageData.width, imageData.height);
        channelInfo[currentChannelIndex++] = {id: 0, length};
        length = channelG.write(stream, imageData.width, imageData.height);
        channelInfo[currentChannelIndex++] = {id: 1, length};
        length = channelB.write(stream, imageData.width, imageData.height);
        channelInfo[currentChannelIndex++] = {id: 2, length};
      }
    } else {
      stream.writeUint16(CompressionMethod.RAW);
      stream.writeUint16(CompressionMethod.RAW);
      stream.writeUint16(CompressionMethod.RAW);
      stream.writeUint16(CompressionMethod.RAW);
    }
  }

  createMaskBitmapChannel(layerRecord:LayerRecord, channelId : ChannelId):Buffer1|null {
    let channels:Array<ChannelRAW|ChannelRLE> = this.channel;
    let maskIndex = layerRecord.channelInfo.findIndex((info:LayerRecordInfo)=>{ return info.id == channelId; });
    const lmd = layerRecord.layerMaskData;
    if(channelId === ChannelId.UserSuppliedMask && maskIndex >= 0) {
      if(lmd.bottom === null || lmd.top === null || lmd.right === null || lmd.left === null)
        throw new Error("UserSuppliedMask found but bounding box not available in lmd");
      let width = lmd.right - lmd.left;
      let height = lmd.bottom - lmd.top;
      if (width === 0 || height === 0)  return null;
      return new Buffer1(width, height, channels[maskIndex].channel)
    } else if(channelId === ChannelId.RealUserSuppliedMask && maskIndex >= 0) {
      if(lmd.realBottom === null || lmd.realTop === null || lmd.realRight === null || lmd.realLeft === null)
        throw new Error("RealUserSuppliedMask found but bounding box not available in lmd");
      let width = lmd.realRight - lmd.realLeft;
      let height = lmd.realBottom - lmd.realTop;
      if (width === 0 || height === 0) return null;
      return new Buffer1(width, height, channels[maskIndex].channel)
    } else {
      return null;
    }
  }

  createComponentChannels(layerRecord:LayerRecord):Channels|null {
    let width:number = (layerRecord.right - layerRecord.left);
    let height:number = (layerRecord.bottom - layerRecord.top);

    if (width === 0 || height === 0) {
      return null;
    }

    let idxR = layerRecord.channelInfo.findIndex((info:LayerRecordInfo)=> { return info.id === ChannelId.Red; });
    let idxG = layerRecord.channelInfo.findIndex((info:LayerRecordInfo)=> { return info.id === ChannelId.Green; });
    let idxB = layerRecord.channelInfo.findIndex((info:LayerRecordInfo)=> { return info.id === ChannelId.Blue; });
    let idxA = layerRecord.channelInfo.findIndex((info:LayerRecordInfo)=> { return info.id === ChannelId.TransparencyMask; });

    return {
      r : new Buffer1(width, height, this.channel[idxR].channel),
      g : new Buffer1(width, height, this.channel[idxG].channel),
      b : new Buffer1(width, height, this.channel[idxB].channel),
      a : idxA >= 0 ? new Buffer1(width, height, this.channel[idxA].channel) : null,
    }
  }
}