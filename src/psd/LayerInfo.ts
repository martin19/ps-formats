import {LayerRecord} from "./LayerRecord";
import {ChannelImageData} from "./ChannelImageData";
import {StreamReader} from "./StreamReader";
import {Header} from "./Header";
import {StreamWriter} from "./StreamWriter";
import {Buffer4} from "../../Storage/Buffer4";
import {Buffer1} from "../../Storage/Buffer1";
export class LayerInfo {
  private _offset:number = 0;
  private _length:number = 0;

  layerCount:number = 0;
  layerRecord:LayerRecord[] = [];
  channelImageData:ChannelImageData[] = [];


  constructor() {
    this.layerRecord = [];
    this.channelImageData = [];
  }

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, header:Header) {
    let i:number;
    let il:number;
    let layerRecord:LayerRecord;
    let channelImageData:ChannelImageData;

    this._offset = stream.tell();
    if(header.version === 2) {
      this._length = stream.readUint64() + 8;
    } else {
      this._length = stream.readUint32() + 4;
    }

    this.layerCount = Math.abs(stream.readInt16());

    for (i = 0, il = this.layerCount; i < il; ++i) {
      layerRecord = new LayerRecord();
      layerRecord.parse(stream, header);
      this.layerRecord[i] = layerRecord;
    }

    for (i = 0, il = this.layerCount; i < il; ++i) {
      channelImageData = new ChannelImageData();
      channelImageData.parse(stream, header, this.layerRecord[i]);
      this.channelImageData[i] = channelImageData;
    }
    stream.seek(this._offset + this._length, 0);
  }
  
  write(stream:StreamWriter, header:Header, layerImageData : (Buffer4|null)[],
        layerMaskData : (Buffer1|null)[],
        realLayerMaskData : (Buffer1|null)[]) {
    let i : number;
    let il : number;
    let ipChannelInfo : number[] = [];

    let ipLength = stream.tell();
    stream.writeUint32(42); //length

    let ipDataStart = stream.tell();
    stream.writeInt16(-this.layerRecord.length);

    for (i=0, il = this.layerRecord.length; i < il; ++i) {
      ipChannelInfo.push(this.layerRecord[i].write(stream, header));
    }

    for (i=0, il = this.layerRecord.length; i < il; ++i) {
      new ChannelImageData().write(stream, this.layerRecord[i], layerImageData[i],
        layerMaskData[i], realLayerMaskData[i]);

      //write channel info.
      let ipNow = stream.tell();
      stream.seek(ipChannelInfo[i], 0);
      let channelInfo = this.layerRecord[i].channelInfo;
      channelInfo.forEach(value => {
        stream.writeInt16(value.id);
        stream.writeUint32(value.length);
      });
      stream.seek(ipNow, 0);
    }

    let ipDataEnd = stream.tell();

    //write length field.
    let ipNow = stream.tell();
    let length = ipDataEnd - ipDataStart;
    stream.seek(ipLength, 0);
    stream.writeUint32(ipDataEnd - ipDataStart);
    stream.seek(ipNow, 0);
    return length;
  }
}