import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {DescriptorInfoBlockFactory, IDescriptorInfoBlock} from "./DescriptorInfoBlock";
import {StreamWriter} from "../StreamWriter";

export class Enmr implements IDescriptorInfoBlock {
  private _offset:number = 0;
  private _length:number = 0;

  name:string = "";
  classId:string = "";
  typeId:string = "";
  _enum:string = "";

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, length:number, header:Header) {

    this._offset = stream.tell();

    let len = stream.readUint32();
    this.name = stream.readWideString(len);

    len = stream.readUint32() || 4;
    this.classId = stream.readString(len);

    len = stream.readUint32() || 4;
    this.typeId = stream.readString(len);

    len = stream.readUint32() || 4;
    this._enum = stream.readString(len);


    this._length = stream.tell() - this._offset;
  }

  write(stream:StreamWriter) {
    //TODO: implement
    throw new Error("Enmr writer not implemented.")
  }

  getLength() {
    //return this._type.length + 4 + this._enum.length + 4;
    return 0;
  }
}

