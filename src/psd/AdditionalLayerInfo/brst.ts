import {StreamReader} from "../StreamReader";
import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {Header} from "../Header";
import {StreamWriter} from "../StreamWriter";

export class brst implements IAdditionalLayerInfoBlock {

  private _offset : number = 0;
  private _length : number = 0;

  channels : number[] = [];

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, length : number, header:Header) {
    this._offset = stream.tell();

    for(var i = 0; i < length/4; i++) {
      this.channels.push(stream.readUint32())
    }

    this._length = stream.tell() - this._offset;
  }


  write(stream:StreamWriter):void {
    for(var i = 0; i < this.channels.length;i++) {
      stream.writeUint32(this.channels[i]);
    }
  }

  getLength():number {
    return this.channels.length*4;
  }
}