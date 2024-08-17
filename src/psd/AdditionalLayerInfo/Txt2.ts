import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {StreamWriter} from "../StreamWriter";

export class Txt2 implements IAdditionalLayerInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;

  bytes:Uint8Array = new Uint8Array();

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, length:number, header?:Header) {
    this._offset = stream.tell();
    this.bytes = stream.read(length);

    this._length = stream.tell() - this._offset;
  }

  write(stream:StreamWriter):void {
    //TODO:
  }
}