import {StreamReader} from "../StreamReader";
import {StreamWriter} from "../StreamWriter";
export class ir1069 {

  private _offset:number = 0;
  private _length:number = 0;

  layerCount:number = 0;
  layerIds:number[] = [];

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader) {
    this._offset = stream.tell();

    this.layerCount = stream.readUint16();
    this.layerIds = [];
    for(let i = 0; i < this.layerCount; i++) {
      this.layerIds.push(stream.readUint32());
    }
    this._length = stream.tell() - this._offset;
  }

  write(stream:StreamWriter):void {
    //TODO
  }

  getLength():number {
    return 4;
  }
}
