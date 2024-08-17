
import {LayerBlendingRanges} from "./LayerBlendingRanges";
import {AdditionalLayerInfo} from "./AdditionalLayerInfo";
import {StreamReader} from "./StreamReader";
import {Header} from "./Header";
import {LayerMaskData} from "./LayerMaskData";
import {StreamWriter} from "./StreamWriter";

export interface LayerRecordInfo {
  id : number,
  length : number
}

export class LayerRecord {

  private _offset : number = 0;
  private _length : number = 0;


  top : number = 0;
  left : number = 0;
  bottom : number = 0;
  right : number = 0;
  channels : number = 0;
  channelInfo : LayerRecordInfo[] = [];
  blendMode : string = "";
  opacity : number = 0;
  isClippingMask : number = 0;
  flags : number = 0;
  filter : number = 0;
  name : string = "";
  extraLength : number = 0;
  layerMaskData : LayerMaskData = new LayerMaskData();
  blendingRanges : LayerBlendingRanges = new LayerBlendingRanges();
  additionalLayerInfo : Array<AdditionalLayerInfo> = [];

  constructor() {
    this.channelInfo = [];
  }

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, header:Header) {
    let pos : number;
    let i : number;
    let il : number;
    let additionalLayerInfo:AdditionalLayerInfo;

    this._offset = stream.tell();

    // rectangle
    this.top = stream.readInt32();
    this.left = stream.readInt32();
    this.bottom = stream.readInt32();
    this.right = stream.readInt32();

    // channel information
    this.channels = stream.readUint16();
    for (i = 0, il = this.channels; i < il; ++i) {
      const id = stream.readInt16();
      let length;
      if(header.version === 2) {
        length = stream.readUint64();
      } else {
        length = stream.readUint32();
      }
      this.channelInfo[i] = { id, length };
    }
    // signature
    if (stream.readString(4) !== '8BIM') {
      throw new Error('invalid blend mode signature');
    }

    // blend mode
    this.blendMode = stream.readString(4);

    // opacity
    this.opacity = stream.readUint8();

    // clipping
    this.isClippingMask = stream.readUint8();

    // flags
    this.flags = stream.readUint8();

    // filter
    this.filter = stream.readUint8();

    // extra field length
    this.extraLength = stream.readUint32();
    pos = stream.tell() + this.extraLength;

    // layer mask data
    this.layerMaskData = new LayerMaskData();
    this.layerMaskData.parse(stream);

    // layer blending ranges
    this.blendingRanges = new LayerBlendingRanges();
    this.blendingRanges.parse(stream);

    // name
    let stringLength = stream.readUint8();
    this.name = stream.readString(stringLength);
    stream.seek((4 - ((1 + stringLength) % 4)) % 4); // padding

    // additional information
    this.additionalLayerInfo = [];
    while (stream.tell() < pos) {
      additionalLayerInfo = new AdditionalLayerInfo();
      additionalLayerInfo.parse(stream, header);
      this.additionalLayerInfo.push(additionalLayerInfo);
    }

    this._length = stream.tell() - this._offset;
  }
  
  write(stream:StreamWriter, header:Header):number {
    let il : number;
    
    // rectangle
    stream.writeInt32(this.top);
    stream.writeInt32(this.left);
    stream.writeInt32(this.bottom);
    stream.writeInt32(this.right);

    //channel information
    stream.writeUint16(this.channels);
    let ipChannelInfo = stream.tell();
    for (let id = -1; id < this.channels-1; id++) {
      stream.writeInt16(id);
      stream.writeUint32(2);
    }

    //signature
    stream.writeString("8BIM");

    // blend mode
    stream.writeString(this.blendMode);

    // opacity
    stream.writeUint8(this.opacity);

    // clipping
    stream.writeUint8(this.isClippingMask);

    // flags
    stream.writeUint8(this.flags);

    // filter
    stream.writeUint8(0);

    // name
    let name = this.name;
    let namePaddingLength = 4 - (((this.name.length+1) % 4) == 0 ? 4 : ((this.name.length+1) % 4));

    let ipExtraLength = stream.tell();
    stream.writeUint32(42);
    let ipExtraDataStart = stream.tell();

    // layer mask data
    this.layerMaskData.write(stream);
    
    // layer blending ranges
    this.blendingRanges.write(stream);

    // layer name
    stream.writeUint8(name.length);
    stream.writeString(name);
    for(let i = 0; i < namePaddingLength;i++) {
      stream.writeUint8(0);
    }

    // additional information
    for(let i = 0; i < this.additionalLayerInfo.length; i++) {
      this.additionalLayerInfo[i].write(stream, header);  
    }

    let ipExtraDataEnd = stream.tell();

    //write extra data length field.
    let length = ipExtraDataEnd - ipExtraDataStart;

    let ipNow = stream.tell();
    stream.seek(ipExtraLength, 0);
    stream.writeUint32(length);
    stream.seek(ipNow, 0);

    return ipChannelInfo;
  }
}