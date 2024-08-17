import {StreamReader} from "./StreamReader";
import {StreamWriter} from "./StreamWriter";
import {ColorMode} from "./EnumColorMode";

export class Header {

  private _offset:number = 0;
  private _length:number = 0;

  signature:string = "";
  version:number = 1;
  reserved:Uint8Array = new Uint8Array([0,0,0,0,0,0]);
  channels:number = 0;
  rows:number = 0;
  columns:number = 0;
  depth:number = 0;
  colorMode:ColorMode = ColorMode.RGB_COLOR;

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader) {
    this._offset = stream.tell();

    // signature
    this.signature = stream.readString(4);
    if (this.signature !== '8BPS') {
      throw new Error('invalid signature');
    }

    this.version = stream.readUint16();
    this.reserved = stream.read(6);
    this.channels = stream.readUint16();
    this.rows = stream.readUint32();
    this.columns = stream.readUint32();
    this.depth = stream.readUint16();
    this.colorMode = stream.readUint16();

    this._length = stream.tell() - this._offset;
  }
  
  write(stream:StreamWriter) {
    stream.writeString("8BPS");
    stream.writeUint16(1);
    stream.write([0,0,0,0,0,0]);
    stream.writeUint16(this.channels);
    stream.writeUint32(this.rows);
    stream.writeUint32(this.columns);
    stream.writeUint16(this.depth);
    stream.writeUint16(this.colorMode);
  }
}