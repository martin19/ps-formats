import {StreamReader} from "../StreamReader";
import {StreamWriter} from "../StreamWriter";
import {PathRecord} from "../PathRecord";

//see ir1025
export class irPath {

  private _offset:number = 0;
  private _length:number = 0;

  name:String = "";
  path : PathRecord[] = [];

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  set length(value: number) {
    this._length = value;
  }

  parse(stream:StreamReader) {
    this._offset = stream.tell();
    let limit:number = stream.tell() + this._length;

    this.path = [];
    while (stream.tell() + 26 <= limit) {
      let pathRecord = new PathRecord();
      pathRecord.parse(stream);
      this.path.push(pathRecord);
    }

    this._length = stream.tell() - this._offset;
  }


  write(stream:StreamWriter):void {
    this.path.forEach(pathRecord => {
      pathRecord.write(stream);
    });
  }

  getLength():number {
    return this.path.length * 26;
  }
}
