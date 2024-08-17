import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {StreamWriter} from "../StreamWriter";
export class iOpa implements IAdditionalLayerInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;

  /** TODO: 公式の仕様？ */
  opacity:number = 0;

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, length?:number, header?:Header) {
    this._offset = stream.tell();

    // TODO: おそらく 1 Byte で Opacity を表していて残りはパディングだと思われる
    // console.log('iOpa:', stream.fetch(stream.tell(), stream.tell()+4));
    this.opacity = stream.readUint8();
    stream.seek(3);

    this._length = stream.tell() - this._offset;
  }


  write(stream:StreamWriter):void {
    stream.writeUint8(this.opacity);
    for(var i = 0; i < 3;i++) {
      stream.writeUint8(0);
    }
  }

  getLength():number {
    return 4;
  }
}