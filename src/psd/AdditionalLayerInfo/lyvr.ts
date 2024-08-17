import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {StreamWriter} from "../StreamWriter";
export class lyvr implements IAdditionalLayerInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;

  version:number = 0;

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, length?:number, header?:Header) {
    this._offset = stream.tell();

    this.version = stream.readUint32();

    this._length = stream.tell() - this._offset;
  }


  write(stream:StreamWriter):void {
    stream.writeUint32(this.version);
  }

  getLength():number {
    return 4;
  }
}