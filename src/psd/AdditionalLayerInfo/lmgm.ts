import {StreamReader} from "../StreamReader";
import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {Header} from "../Header";
import {StreamWriter} from "../StreamWriter";

export class lmgm implements IAdditionalLayerInfoBlock {

  private _offset : number = 0;
  private _length : number = 0;

  layerMaskHidesEffects : boolean = false;

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, length? : number, header?:Header) {
    this._offset = stream.tell();

    this.layerMaskHidesEffects = !!stream.readUint8();

    // padding
    stream.seek(3);

    this._length = stream.tell() - this._offset;
  }


  write(stream:StreamWriter):void {
    stream.writeUint8(this.layerMaskHidesEffects ? 1 : 0);
    for(var i = 0; i < 3;i++) {
      stream.writeUint8(0);
    }
  }

  getLength():number {
    return 4;
  }
}