import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {DescriptorInfoBlockFactory, IDescriptorInfoBlock} from "./DescriptorInfoBlock";
import {Descriptor} from "../Descriptor";
import {StreamWriter} from "../StreamWriter";

export class ObAr implements IDescriptorInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;

  item:Array<{type:string,data:IDescriptorInfoBlock}> = [];

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, length?:number, header?:Header) {
    let item:Descriptor;
    let i:number;
    let il:number;

    this._offset = stream.tell();

    let x = stream.readUint32();
    let y = stream.readUint32();
    let z = stream.readUint32();
    let a = stream.readInt8();
    let b = stream.readPascalString();
    let items = stream.readUint32();
    this.item = [];

    for (i = 0; i < items; ++i) {
      let c = stream.readUint32();
      let name = stream.readString(4);
      let type = stream.readString(4);

      let data = DescriptorInfoBlockFactory.create(type);
      if(data) {
        data.parse(stream);

        this.item.push({
          type: type,
          data: data
        });
      }
    }

    this._length = stream.tell() - this._offset;
  }

  write(stream:StreamWriter):void {
    console.warn('OSType key not implemented (undocumented): ObAr(ObjectArray?)');
  }

  getLength():number {
    return 0;
  }
}