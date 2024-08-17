import {StreamReader} from "../StreamReader";
import {StreamWriter} from "../StreamWriter";
export class ir1037 {

  private _offset:number = 0;
  private _length:number = 0;

  globalAngle:number = 0;

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader) {
    this._offset = stream.tell();
    this.globalAngle = stream.readUint32();
    this._length = stream.tell() - this._offset;
  }


  write(stream:StreamWriter):void {
    stream.writeUint32(this.globalAngle);
  }

  getLength():number {
    return 4;
  }
}
