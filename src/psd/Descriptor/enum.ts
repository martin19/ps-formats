import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {DescriptorInfoBlockFactory, IDescriptorInfoBlock} from "./DescriptorInfoBlock";
import {StreamWriter} from "../StreamWriter";

export class _enum implements IDescriptorInfoBlock {
  private _offset:number = 0;
  private _length:number = 0;

  _type:string = "";
  _enum:string = "";

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, length:number, header:Header) {

    this._offset = stream.tell();

    // type
    length = stream.readUint32();
    if (length === 0) {
      length = 4;
    }
    this._type = stream.readString(length);

    // enum
    length = stream.readUint32();
    if (length === 0) {
      length = 4;
    }
    this._enum = stream.readString(length);

    this._length = stream.tell() - this._offset;
  }

  write(stream:StreamWriter) {
    if(this._type.length === 4) {
      stream.writeUint32(0);
    } else {
      var length = this._type.length;
      stream.writeUint32(length);
    }
    stream.writeString(this._type);

    if(this._enum.length === 4) {
      stream.writeUint32(0);
    } else {
      length = this._enum.length;
      stream.writeUint32(length);
    }
    stream.writeString(this._enum);
  }

  getLength() {
    return this._type.length + 4 + this._enum.length + 4;
  }
}

