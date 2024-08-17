import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {StreamWriter} from "../StreamWriter";
export class lclr implements IAdditionalLayerInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;

  color:number[] = [];
  // TODO: flags のパースも行う

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, length?:number, header?:Header) {
    this._offset = stream.tell();
    this.color = [
      stream.readUint32()>>16,
      stream.readUint32()
    ];
    this._length = stream.tell() - this._offset;
  }


  write(stream:StreamWriter):void {
    stream.writeUint32(this.color[0]);
    stream.writeUint32(this.color[1]);
  }

  getLength():number {
    return 8;
  }
}
