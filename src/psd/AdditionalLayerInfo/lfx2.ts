import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {Descriptor} from "../Descriptor";
import {StreamWriter} from "../StreamWriter";
export class lfx2 implements IAdditionalLayerInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;

  version:number = 0;
  descriptorVersion:number = 0;
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
    this.descriptorVersion = stream.readUint32();
    this.descriptor = new Descriptor();
    this.descriptor.parse(stream);

    this._length = stream.tell() - this._offset;
  }


  write(stream:StreamWriter):void {
    stream.writeUint32(this.version);
    stream.writeUint32(this.descriptorVersion);
    this.descriptor.write(stream);
  }
}
