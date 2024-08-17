import {StreamReader} from "./StreamReader";
import {Header} from "./Header";
import {StreamWriter} from "./StreamWriter";

export class GlobalLayerMaskInfo {

  private _offset:number = 0;
  private _length:number = 0;

  overlayColorSpace:number = 0;
  colorComponents:number[] = [];
  opacity:number = 0;
  kind:number = 0;
  filter:Array<number>|Uint8Array = new Uint8Array();

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, header:Header) {
    let length:number;

    this._offset = stream.tell();
    length = stream.readUint32();
    this._length = length + 4;

    this.overlayColorSpace = stream.readUint16();
    this.colorComponents = [
      stream.readUint16(), stream.readUint16(),
      stream.readUint16(), stream.readUint16()
    ];
    this.opacity = stream.readUint16();
    this.kind = stream.readUint8();
    this.filter = stream.read(this._offset + this._length - stream.tell());

    stream.seek(this._offset + this._length, 0);
  }

  write(stream:StreamWriter, header?:Header) {
    stream.writeUint32(0);

    //TODO: find out when this information is required
    // stream.writeUint32(this.getLength()-4);
    // stream.writeUint16(this.overlayColorSpace);
    // for(var i = 0; i < 4;i++) {
    //   stream.writeUint16(this.colorComponents[i]);
    // }
    // stream.writeUint16(this.opacity);
    // stream.writeUint8(this.kind);
    // stream.write([0,0,0]);

    return 4;
  }
}