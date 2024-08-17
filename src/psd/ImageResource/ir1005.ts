import {StreamReader} from "../StreamReader";
import {StreamWriter} from "../StreamWriter";

enum DocumentDimensionUnit {
  pixels = 0,
  inches = 1,
  cm = 2,
  points = 3,
  picas = 4,
  columns = 5
}
enum DocumentResolutionUnit {
  pixelsPerInch = 0,
  pixelsPerCm = 1
}

export class ir1005 {

  private _offset:number = 0;
  private _length:number = 0;

  hres : number = 0;
  vres : number = 0;
  hResUnit : DocumentResolutionUnit = DocumentResolutionUnit.pixelsPerCm;
  vResUnit : DocumentResolutionUnit = DocumentResolutionUnit.pixelsPerCm;
  hDimUnit : DocumentDimensionUnit = DocumentDimensionUnit.pixels;
  vDimUnit : DocumentDimensionUnit = DocumentDimensionUnit.pixels;

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader) {
    this._offset = stream.tell();
    this.hres = stream.readUint32() / 0x10000;
    this.hResUnit = stream.readUint16() as DocumentResolutionUnit;
    this.hDimUnit = stream.readUint16() as DocumentDimensionUnit;
    this.vres = stream.readUint32() / 0x10000;
    this.vResUnit = stream.readUint16() as DocumentResolutionUnit;
    this.vDimUnit = stream.readUint16() as DocumentDimensionUnit;
    this._length = stream.tell() - this._offset;
  }


  write(stream:StreamWriter):void {
    stream.writeUint32(Math.floor(this.hres * 0x10000));
    stream.writeUint16(this.hResUnit);
    stream.writeUint16(this.hDimUnit);
    stream.writeUint32(Math.floor(this.vres * 0x10000));
    stream.writeUint16(this.vResUnit);
    stream.writeUint16(this.vDimUnit);
  }

  getLength():number {
    return 16;
  }
}
