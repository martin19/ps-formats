import {StreamReader} from "./StreamReader";
import {Header} from "./Header";
import {StreamWriter} from "./StreamWriter";
import {ColorMode} from "./EnumColorMode";
export class ColorModeData {

  private _offset:number = 0;
  private _length:number = 0;

  data:Array<number>|Uint8Array = new Uint8Array();

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, header:Header) {
    var length:number;

    this._offset = stream.tell();

    length = stream.readUint32();
    this._length = length + 4;

    if (header.colorMode === ColorMode.INDEXED_COLOR && length !== 768) {
      throw new Error('invalid color mode data');
    }

    this.data = stream.read(length);
  }

  write(stream:StreamWriter, header:Header) {
    if(header.colorMode === ColorMode.INDEXED_COLOR && this.data.length !== 768) {
      throw new Error('invalid color mode data');
    }
    stream.writeUint32(this.data.length);
    stream.write(this.data);
  }
}
