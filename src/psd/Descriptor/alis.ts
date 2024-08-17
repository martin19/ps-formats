import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {DescriptorInfoBlockFactory, IDescriptorInfoBlock} from "./DescriptorInfoBlock";
import {StreamWriter} from "../StreamWriter";

export class alis implements IDescriptorInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;

  value:Array<number>|Uint8Array = [];

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, length?:number, header?:Header) {
    this._offset = stream.tell();

    length = stream.readUint32();
    // TODO: きちんと parse する
    this.value = stream.read(length);

    this._length = stream.tell() - this._offset;
  }

  write(stream:StreamWriter) {
    stream.writeUint32(this.value.length);
    stream.write(this.value);
  }
  
  getLength() {
    this._length = this.value.length + 4;
    return this._length;
  }
}