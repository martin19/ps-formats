import {StreamReader} from "../StreamReader";
import {StreamWriter} from "../StreamWriter";
export class ir1049 {

  private _offset:number = 0;
  private _length:number = 0;

  globalAltitude:number = 0;

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader) {
    this._offset = stream.tell();
    this.globalAltitude = stream.readUint32();
    this._length = stream.tell() - this._offset;
  }


  write(stream:StreamWriter):void {
    stream.writeUint32(this.globalAltitude);
  }

  getLength():number {
    return 4;
  }
}
