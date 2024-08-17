import {StreamReader} from "./StreamReader";
import {StreamWriter} from "./StreamWriter";

export class LayerMaskData {
  top:number|null = null;
  left:number|null = null;
  bottom:number|null = null;
  right:number|null = null;
  defaultColor:number|null = null;
  flags:number|null = null;

  userMaskDensity : number|null = null;
  userMaskFeather : number|null = null;
  vectorMaskDensity : number|null = null;
  vectorMaskFeather : number|null = null;

  realFlags:number|null = null;
  realBackground:number|null = null;
  realTop:number|null = null;
  realLeft:number|null = null;
  realBottom:number|null = null;
  realRight:number|null = null;

  constructor() {}

  parse(stream:StreamReader) {
    const length = stream.readUint32();
    const offset = stream.tell();

    if (length === 0) {
      return;
    }

    this.top = stream.readInt32();
    this.left = stream.readInt32();
    this.bottom = stream.readInt32();
    this.right = stream.readInt32();
    this.defaultColor = stream.readUint8();
    this.flags = stream.readUint8();

    if (length === 20) {
      const padding = stream.readUint16();
      return;
    }

    if (length >= 36) {
      this.realFlags = stream.readUint8();
      this.realBackground = stream.readUint8();
      this.realTop = stream.readInt32();
      this.realLeft = stream.readInt32();
      this.realBottom = stream.readInt32();
      this.realRight = stream.readInt32();
    }

    if(this.flags & (1 << 4)) {
      const maskParameterFlags = stream.readUint8();
      if(maskParameterFlags & 1) this.userMaskDensity = stream.readUint8();
      if(maskParameterFlags & 2) this.userMaskFeather = stream.readFloat64();
      if(maskParameterFlags & 4) this.vectorMaskDensity = stream.readUint8();
      if(maskParameterFlags & 8) this.vectorMaskFeather = stream.readFloat64();
    }

    stream.seek(offset + length, 0);
  }

  public hasMaskUser() {
    return this.top !== null && this.left !== null && this.bottom !== null && this.right !== null &&
      this.defaultColor !== null && this.flags !== null;
  }

  public hasMaskReal() {
    return this.realFlags !== null && this.realBackground !== null && this.realTop !== null && this.realLeft !== null &&
      this.realBottom !== null && this.realRight !== null;
  }

  public hasMaskParameters() {
    return this.userMaskFeather !== null || this.userMaskDensity !== null ||
      this.vectorMaskFeather !== null || this.vectorMaskDensity !== null;
  }

  write(stream:StreamWriter) {
    const ipLength = stream.tell();
    const length = this.getLength();
    stream.writeUint32(length);

    const ipDataStart = stream.tell();
    if(this.hasMaskUser()) {
      // rectangle enclosing layer mask
      stream.writeInt32(this.top as number);
      stream.writeInt32(this.left as number);
      stream.writeInt32(this.bottom as number);
      stream.writeInt32(this.right as number);

      // default color
      stream.writeUint8(this.defaultColor as number);

      // flags
      stream.writeUint8(this.flags as number);

      // padding
      if(length === 20) stream.writeUint16(0);
    }

    if(this.hasMaskReal()) {
      // real flags
      stream.writeUint8(this.realFlags as number);

      // real user mask background
      stream.writeUint8(this.realBackground as number);

      // rectangle enclosing layer mask
      stream.writeInt32(this.realTop as number);
      stream.writeInt32(this.realLeft as number);
      stream.writeInt32(this.realBottom as number);
      stream.writeInt32(this.realRight as number);
    }

    if(this.flags !== null && this.flags & (1 << 4)) {
      let maskParameterFlags = 0;
      maskParameterFlags |= !!this.userMaskDensity ? 1 : 0;
      maskParameterFlags |= !!this.userMaskFeather ? 2 : 0;
      maskParameterFlags |= !!this.vectorMaskDensity ? 4 : 0;
      maskParameterFlags |= !!this.vectorMaskFeather ? 8 : 0;
      stream.writeUint8(maskParameterFlags);

      if(this.userMaskDensity) stream.writeUint8(this.userMaskDensity);
      if(this.userMaskFeather) stream.writeFloat64(this.userMaskFeather);
      if(this.vectorMaskDensity) stream.writeUint8(this.vectorMaskDensity);
      if(this.vectorMaskFeather) stream.writeFloat64(this.vectorMaskFeather);
    }
    const ipDataEnd = stream.tell();
    const actualLength = ipDataEnd - ipDataStart;
    if(actualLength !== length) throw new Error(`actual lmd length=${actualLength}, expected lmd length=${length}`);
  }

  getLength():number {
    let length = 0;
    if(!this.hasMaskUser() && !this.hasMaskReal() && !this.hasMaskParameters()) return 0;
    if(this.hasMaskUser()) length += 18;
    if(!this.hasMaskReal() && !this.hasMaskParameters()) return 20;
    if(this.hasMaskReal()) length += 18;
    if(this.hasMaskParameters()) length += 1;
    if(this.userMaskDensity !== null) length += 1;
    if(this.userMaskFeather !== null) length += 8;
    if(this.vectorMaskDensity !== null) length += 1;
    if(this.vectorMaskFeather !== null) length += 8;
    return length;
  }

}
