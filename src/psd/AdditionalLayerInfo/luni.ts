import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {StreamWriter} from "../StreamWriter";
export class luni implements IAdditionalLayerInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;

  layerName:string = "";

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader /*, length?:number, header?:Header*/) {
    let length:number;

    this._offset = stream.tell();
    length = stream.readUint32();
    this.layerName = stream.readWideString(length);

    // NOTE: length が奇数の時はパディングがはいる
    if ((length & 1) === 1) {
      stream.seek(2);
    }

    this._length = stream.tell() - this._offset;
  }


  write(stream:StreamWriter):void {
    stream.writeUint32(this.layerName.length * 2);
    stream.writeWideString(this.layerName);
  }

  getLength():number {
    return 4 + this.layerName.length * 2;
  }
}