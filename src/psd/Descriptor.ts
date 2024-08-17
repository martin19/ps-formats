import {StreamReader} from "./StreamReader";
import {DescriptorInfoBlockFactory, IDescriptorInfoBlock} from "./Descriptor/DescriptorInfoBlock";
import {StreamWriter} from "./StreamWriter";

export type DescriptorItemType = "alis"|"bool"|"doub"|"enum"|"GlbC"|"GlbO"|"long"|"ObAr"|"obj "|"Objc"|"prop"|"rele"|"tdta"|"TEXT"|"type"|"UnFl"|"UntF"|"VlLs";

export interface IDescriptorItem {
  key:string,
  type:DescriptorItemType,
  data:IDescriptorInfoBlock
}

export class Descriptor {

  private _offset:number = 0;
  private _length:number = 0;

  name:string = "";
  classId:string = "";
  items:number = 0;
  item:IDescriptorItem[] = [];


  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader) {
    let length:number;
    let key:string;
    let type:DescriptorItemType;
    let i:number;
    let il:number;

    this._offset = stream.tell();

    length = stream.readUint32();
    this.name = stream.readWideString(length);

    length = stream.readUint32() || 4;
    this.classId = stream.readString(length);

    this.items = stream.readUint32();
    this.item = [];

    for (i = 0, il = this.items; i < il; ++i) {
      length = stream.readUint32() || 4;
      key = stream.readString(length);
      type = stream.readString(4) as DescriptorItemType;

      let data = DescriptorInfoBlockFactory.create(type);
      if(data) {
        data.parse(stream);
        this.item.push({key: key, type: type, data: data});
      }
    }

    this._length = stream.tell() - this._offset;
  }

  write(stream:StreamWriter) {
    let i : number;
    let il : number;

    stream.writeUint32(this.name.length);
    stream.writeWideString(this.name);
    if(this.classId.length === 4) {
      stream.writeUint32(0);
    } else {
      stream.writeUint32(this.classId.length);
    }
    stream.writeString(this.classId);
    stream.writeUint32(this.item.length);

    for (i = 0, il = this.item.length; i < il; ++i) {

      if(this.item[i].key.length === 4) {
        stream.writeUint32(0);
      } else {
        stream.writeUint32(this.item[i].key.length);
      }
      stream.writeString(this.item[i].key);
      stream.writeString(this.item[i].type);


      //TODO: what is this?
      // if (typeof DescriptorInfoBlock[this.item[i].type] !== 'function') {
      //   console.warn('OSType Key not implemented:', this.item[i].key);
      //   break;
      // }

      this.item[i].data.write(stream);
    }
  }
}