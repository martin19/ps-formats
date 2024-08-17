import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {StreamWriter} from "../StreamWriter";
import {Descriptor, IDescriptorItem} from "../Descriptor";
import {DescriptorUtils} from "../DescriptorUtils";
import {Objc} from "../Descriptor/Objc";
import {VlLs} from "../Descriptor/VlLs";
import {TEXT} from "../Descriptor/TEXT";
export class cinf implements IAdditionalLayerInfoBlock {

  private _offset : number = 0;
  private _length : number = 0;

  version : number = 16;
  descriptor : Descriptor = new Descriptor();

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, length?:number, header?:Header) {
    this._offset = stream.tell();

    this.version = stream.readUint32();
    this.descriptor = new Descriptor();
    this.descriptor.parse(stream);

    console.log(this.descriptor);

    this._length = stream.tell() - this._offset;
  }


  write(stream:StreamWriter):void {
    //TODO:
    throw new Error("not implemented");
  }

  getLength():number {
    //TODO:
    throw new Error("not implemented");
  }
}
