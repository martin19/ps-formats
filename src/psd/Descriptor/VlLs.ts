import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {IDescriptorInfoBlock, DescriptorInfoBlockFactory} from "./DescriptorInfoBlock";
import {StreamWriter} from "../StreamWriter";
import {DescriptorItemType} from "../Descriptor";

export class VlLs implements IDescriptorInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;

  item:Array<{type:DescriptorItemType,data:IDescriptorInfoBlock}> = [];


  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, length?:number, header?:Header) {
    let items:number;
    let i:number;
    let type:DescriptorItemType;
    let data:IDescriptorInfoBlock;

    this._offset = stream.tell();

    this.item = [];
    items = stream.readUint32();
    for (i = 0; i < items; ++i) {
      type = stream.readString(4) as DescriptorItemType;

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
    stream.writeUint32(this.item.length);
    for(let i = 0; i < this.item.length; i++) {
      stream.writeString(this.item[i].type);
      //TODO: what is this?
      // if (typeof DescriptorInfoBlock[this.item[i].type] !== 'function') {
      //   console.error('OSType Key not implemented:', this.item[i].type);
      //   return;
      // }
      this.item[i].data.write(stream);
    }
  }
}