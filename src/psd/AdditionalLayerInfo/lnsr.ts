import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {StreamWriter} from "../StreamWriter";
export class lnsr implements IAdditionalLayerInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;

  id:string = "";

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, length?:number, header?:Header) {
    this._offset = stream.tell();
    this.id = stream.readString(4);
    this._length = stream.tell() - this._offset;
  }


  write(stream:StreamWriter):void {
    stream.writeString(this.id);
  }

  getLength():number {
    return this.id.length;
  }
}