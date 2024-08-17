import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {StreamWriter} from "../StreamWriter";
export class shmd implements IAdditionalLayerInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;

  items:number = 0;
  metadata:Array<{ signature : string, key : string, copy : number, data : Array<number>|Uint8Array }> = [];

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, length?:number, header?:Header) {
    let signature:string;
    let key:string;
    let copy:number;
    let data:Array<number>|Uint8Array;
    this.metadata = [];
    let i:number;
    let il:number;

    this._offset = stream.tell();

    this.items = stream.readUint32();

    for (i = 0, il = this.items; i < il; ++i) {
      signature = stream.readString(4);
      key = stream.readString(4);
      copy = stream.readUint8();
      stream.seek(3); // padding
      length = stream.readUint32();
      data = stream.read(length);

      // TODO: オブジェクトではなく型をつくる
      this.metadata.push({
        signature: signature,
        key: key,
        copy: copy,
        data: data
      });
    }

    this._length = stream.tell() - this._offset;
  }


  write(stream:StreamWriter):void {
    stream.writeUint32(this.metadata.length);
    for(let i = 0; i < this.metadata.length; i++) {
      let m = this.metadata[i];
      stream.writeString(m.signature);
      stream.writeString(m.key);
      stream.writeUint8(m.copy);
      for(let j = 0; j < 3; j++) stream.writeUint8(0);
      stream.writeUint32(m.data.length);
      stream.write(m.data);
    }
  }

  getLength():number {
    let length = 4;
    for(let i = 0; i < this.metadata.length; i++) {
      length += 4 + 4 + 4 + 4 + this.metadata[i].data.length;
    }
    return length;
  }
}