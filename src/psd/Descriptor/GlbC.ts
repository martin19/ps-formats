import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {DescriptorInfoBlockFactory, IDescriptorInfoBlock} from "./DescriptorInfoBlock";
import {StreamWriter} from "../StreamWriter";

export class GlbC implements IDescriptorInfoBlock {
  private _offset:number = 0;
  private _length:number = 0;

  name:string = "";
  classId:string = "";

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, length?:number, header?:Header) {
    this._offset = stream.tell();

    length = stream.readUint32();
    this.name = stream.readWideString(length);

    length = stream.readUint32() || 4;
    this.classId = stream.readString(length);

    this._length = stream.tell() - this._offset;
  }

  write(stream:StreamWriter):void {
    stream.writeUint32(this.name.length * 2);
    stream.writeWideString(this.name);
    stream.writeUint32(this.classId.length);
    stream.writeString(this.classId);
  }

  getLength():number {
    return this.name.length * 2 + 4 + this.classId.length + 4;
  }
}