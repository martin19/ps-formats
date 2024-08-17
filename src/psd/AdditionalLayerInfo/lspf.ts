import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {StreamWriter} from "../StreamWriter";
export class lspf implements IAdditionalLayerInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;

  flags:number = 0;

  transparencyLocked:boolean = false;
  compositeLocked:boolean = false;
  positionLocked:boolean = false;
  allLocked:boolean = false;

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }
  parse(stream:StreamReader, length?:number, header?:Header) {
    this._offset = stream.tell();
    this.flags = stream.readUint32();
    this.transparencyLocked = !!(this.flags && (0x01 << 0));
    this.compositeLocked = !!(this.flags && (0x01 << 1));
    this.positionLocked = !!(this.flags && (0x01 << 2));
    this.allLocked = this.transparencyLocked && this.compositeLocked && this.positionLocked;
    this._length = stream.tell() - this._offset;
  }

  write(stream:StreamWriter):void {
    this.flags |= this.transparencyLocked ? (0x01 << 0) : 0;
    this.flags |= this.compositeLocked ? (0x01 << 0) : 0;
    this.flags |= this.positionLocked ? (0x01 << 0) : 0;
    stream.writeUint32(this.flags);
  }

  getLength():number {
    return 4;
  }
}