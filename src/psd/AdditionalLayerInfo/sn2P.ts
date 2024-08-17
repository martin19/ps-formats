import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {StreamWriter} from "../StreamWriter";

export class sn2P implements IAdditionalLayerInfoBlock {

  private _offset : number = 0;
  private _length : number = 0;

  snapToPixels : boolean = false;

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, length?:number, header?:Header) {
    this._offset = stream.tell();
    this.snapToPixels = stream.readUint32() !== 0;
    this._length = stream.tell() - this._offset;
  }

  write(stream:StreamWriter):void {
    //TODO:
    throw new Error("not implemented");
  }

  getLength():number {
    //TODO:
    throw new Error("not implemented");
  }
}