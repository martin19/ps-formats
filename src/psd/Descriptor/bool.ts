import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {DescriptorInfoBlockFactory, IDescriptorInfoBlock} from "./DescriptorInfoBlock";
import {StreamWriter} from "../StreamWriter";

export class bool implements IDescriptorInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;

  value:boolean = false;

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, length?:number, header?:Header) {
    this._offset = stream.tell();
    this.value = !!stream.readUint8();
    this._length = stream.tell() - this._offset;
  }

  write(stream:StreamWriter) {
    stream.writeUint8(this.value ? 1 : 0);
  }

  getLength() {
    return 1;
  }
}