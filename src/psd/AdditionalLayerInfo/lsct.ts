import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {StreamWriter} from "../StreamWriter";
export class lsct implements IAdditionalLayerInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;

  type:number = 0;
  key?:string;
  subType?:number;

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, length:number, header?:Header) {
    var signature:string;

    this._offset = stream.tell();
    this.type = stream.readUint32();

    if (length >= 12) {
      signature = stream.readString(4);
      if (signature !== '8BIM') {
        throw new Error('invalid section divider setting signature:'+ signature);
      }
      this.key = stream.readString(4);
      if(length >= 16) {
        this.subType = stream.readUint32();
      }
    }

    this._length = stream.tell() - this._offset;
  }


  write(stream:StreamWriter):void {
    stream.writeUint32(this.type);
    if(this.key !== undefined) {
      stream.writeString("8BIM");
      stream.writeString(this.key);
      if(this.subType !== undefined) {
        stream.writeUint32(this.subType);
      }
    }
  }
}