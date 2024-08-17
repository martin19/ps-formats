import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {DescriptorInfoBlockFactory, IDescriptorInfoBlock} from "./DescriptorInfoBlock";
import {Descriptor} from "../Descriptor";
import {StreamWriter} from "../StreamWriter";

export class Objc implements IDescriptorInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;

  value:Descriptor = new Descriptor();


  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, length?:number, header?:Header) {
    this._offset = stream.tell();
    this.value = new Descriptor();
    this.value.parse(stream);
    this._length = stream.tell() - this._offset;
  }


  write(stream:StreamWriter):void {
    this.value.write(stream);
  }
}