import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {IDescriptorInfoBlock, DescriptorInfoBlockFactory} from "./DescriptorInfoBlock";
import {StreamWriter} from "../StreamWriter";

let Table:{[key:string]:string} = {
  'prop': 'prop',
  'Clss': 'type',
  'Enmr': 'Enmr',
  'rele': 'rele',
  'Idnt': 'long',
  'indx': 'long',
  'name': 'TEXT'
};

export class _obj implements IDescriptorInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;


  items:number = 0;
  item:Array<any> = [];

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, length?:number, header?:Header) {
    let items:number;
    let key:string;
    let type:string;
    let data:IDescriptorInfoBlock;
    let i:number;

    this._offset = stream.tell();

    this.item = [];
    items = this.items = stream.readUint32();
    for (i = 0; i < items; ++i) {
      key = stream.readString(4);
      type = Table[key];

      let data = DescriptorInfoBlockFactory.create(type);
      if(data) {
        data.parse(stream);
        this.item.push({key: key, data: data});
      }
    }

    this._length = stream.tell() - this._offset;
  };


  write(stream:StreamWriter):void {
    throw new Error("Object reference structure not implemented");
  }

  getLength():number {
    return 0;
  }
}