import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {Descriptor} from "../Descriptor";
import {StreamWriter} from "../StreamWriter";
export class PlLd implements IAdditionalLayerInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;

  type:string = "";
  version:number = 0;
  id:string = "";
  page:number = 0;
  totalPage:number = 0;
  antiAlias:number = 0;
  placedLayerType:number = 0;
  transform:number[] = [];
  warpVersion:number = 0;
  warpDescriptorVersion:number = 0;
  warpDescripto:Descriptor = new Descriptor();

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }
  parse(stream:StreamReader, length?:number, header?:Header) {
    this._offset = stream.tell();

    this.type = stream.readString(4);
    if (this.type !== 'plcL') {
      throw new Error('invalid type:' + this.type);
    }

    this.version = stream.readUint32();
    this.id = stream.readPascalString();
    this.page = stream.readInt32();
    this.totalPage = stream.readInt32();
    this.antiAlias = stream.readInt32();
    this.placedLayerType = stream.readInt32();
    this.transform = [
      stream.readFloat64(), stream.readFloat64(),
      stream.readFloat64(), stream.readFloat64(),
      stream.readFloat64(), stream.readFloat64(),
      stream.readFloat64(), stream.readFloat64()
    ];
    this.warpVersion = stream.readInt32();
    this.warpDescriptorVersion = stream.readInt32();
    this.warpDescripto = new Descriptor();
    this.warpDescripto.parse(stream);

    this._length = stream.tell() - this._offset;
  }

  write(stream:StreamWriter):void {
    stream.writeString("plcL");
    stream.writeUint32(3);
    stream.writePascalString(this.id);
    stream.writeInt32(this.page);
    stream.writeInt32(this.totalPage);
    stream.writeInt32(this.antiAlias);
    stream.writeInt32(this.placedLayerType);
    for(var i = 0; i < 8;i++) {
      stream.writeFloat64(this.transform[i]);
    }
    stream.writeInt32(0);
    stream.writeInt32(16);
    this.warpDescripto.write(stream);
  }
}