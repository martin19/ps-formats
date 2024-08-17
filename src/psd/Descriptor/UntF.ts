import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {DescriptorInfoBlockFactory, IDescriptorInfoBlock} from "./DescriptorInfoBlock";
import {StreamWriter} from "../StreamWriter";

export class UntF implements IDescriptorInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;


  units:string = "";
  value:number = 0;


  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }
  parse(stream:StreamReader, length?:number, header?:Header) {
    this._offset = stream.tell();
    this.units = stream.readString(4);
    this.value = stream.readFloat64();
    this._length = stream.tell() - this._offset;
  }


  write(stream:StreamWriter):void {
    stream.writeString(this.units);
    stream.writeFloat64(this.value);
  }

  getLength():number {
    return 4 + 8;
  }
}

