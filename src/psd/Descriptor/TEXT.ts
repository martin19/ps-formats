import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {DescriptorInfoBlockFactory, IDescriptorInfoBlock} from "./DescriptorInfoBlock";
import {StreamWriter} from "../StreamWriter";

export class TEXT implements IDescriptorInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;

  string:string = "";


  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, length?:number, header?:Header) {
    this._offset = stream.tell();

    length = stream.readUint32();
    this.string = stream.readWideString(length);
    this.string = this.string.substring(0,this.string.length-1);

    this._length = stream.tell() - this._offset;
  }


  write(stream:StreamWriter):void {
    stream.writeUint32(this.string.length);
    stream.writeWideString(this.string);
  }

  getLength():number {
    return this.string.length * 2 + 4;
  }
}