import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {StreamWriter} from "../StreamWriter";
import {PathRecord} from "../PathRecord";

export class vsms implements IAdditionalLayerInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;

  version:number = 0;
  flags : number = 0;
  path : PathRecord[] = [];

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, length:number, header:Header) {
    let limit:number = stream.tell() + length;

    this._offset = stream.tell();
    this.version = stream.readUint32();
    this.flags = stream.readUint32();
    this.path = [];

    while (stream.tell() + 26 <= limit) {
      let pathRecord = new PathRecord();
      pathRecord.parse(stream);
      this.path.push(pathRecord);
    }

    this._length = stream.tell() - this._offset;
  }


  write(stream:StreamWriter):void {
    stream.writeUint32(3);
    stream.writeUint32(this.flags);
    this.path.forEach(path => {
      path.write(stream);
    });
  }
}