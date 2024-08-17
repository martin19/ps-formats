import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {Descriptor} from "../Descriptor";
import {StreamWriter} from "../StreamWriter";
import {ILinkedLayerInfo} from "../../../Effects/GLTypes";
export class lnkE implements IAdditionalLayerInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;

  constructor() {}

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, length:number, header?:Header) {
    this._offset = stream.tell();
    stream.readUint64();
    this._length = stream.tell() - this._offset;
  }


  write(stream:StreamWriter):void {
    throw new Error("not implemented");
  }

}