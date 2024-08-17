import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {StreamWriter} from "../StreamWriter";
export class fxrp implements IAdditionalLayerInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;

  referencePoint:{x:number,y:number} = { x : 0, y : 0 };

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream : StreamReader, length? : number, header? : Header) {
  this._offset = stream.tell();

  this.referencePoint = {
    x : stream.readFloat64(),
    y : stream.readFloat64()
  };

  this._length = stream.tell() - this._offset;
  }


  write(stream:StreamWriter):void {
    stream.writeFloat64(this.referencePoint.x);
    stream.writeFloat64(this.referencePoint.y);
  }

  getLength():number {
    return 16;
  }
}