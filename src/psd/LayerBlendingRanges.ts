import {StreamReader} from "./StreamReader";
import {StreamWriter} from "./StreamWriter";

export type LayerBlendingRange = {
  srcMinBlack : number;
  srcMaxBlack : number;
  srcMinWhite : number;
  srcMaxWhite : number;
  dstMinBlack : number;
  dstMaxBlack : number;
  dstMinWhite : number;
  dstMaxWhite : number;
}

export class LayerBlendingRanges {

  private _offset : number = 0;
  private _length : number = 0;

  channel :Array<LayerBlendingRange>;

  constructor() {
    this.channel = [];
  }

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader) {
    var next:number;

    this._offset = stream.tell();
    this._length = stream.readUint32() + 4;

    if (this._length === 4) {
      window.console.log("skip: layer blending ranges(empty body)");
      return;
    }

    next = this._offset + this._length;

    while (stream.tell() < next) {
      this.channel.push({
        srcMinBlack : stream.readUint8(),
        srcMaxBlack : stream.readUint8(),
        srcMinWhite : stream.readUint8(),
        srcMaxWhite : stream.readUint8(),
        dstMinBlack : stream.readUint8(),
        dstMaxBlack : stream.readUint8(),
        dstMinWhite : stream.readUint8(),
        dstMaxWhite : stream.readUint8()
      });
    }
  }

  getLength() {
    this._length = (this.channel.length*8) + 4;
    return this._length;
  }

  write(stream:StreamWriter) {
    stream.writeUint32(this.getLength()-4);
    for(var i = 0; i < this.channel.length; i++) {
      stream.writeUint8(this.channel[i].srcMinBlack);
      stream.writeUint8(this.channel[i].srcMaxBlack);
      stream.writeUint8(this.channel[i].srcMinWhite);
      stream.writeUint8(this.channel[i].srcMaxWhite);
      stream.writeUint8(this.channel[i].dstMinBlack);
      stream.writeUint8(this.channel[i].dstMaxBlack);
      stream.writeUint8(this.channel[i].dstMinWhite);
      stream.writeUint8(this.channel[i].dstMaxWhite);
    }
  }

}