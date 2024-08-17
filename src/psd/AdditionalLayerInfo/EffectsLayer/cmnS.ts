import {Header} from "../../Header";
import {StreamReader} from "../../StreamReader";
import {IEffectsLayerInfoBlock} from "./EffectsLayerInfoBlock";
import {StreamWriter} from "../../StreamWriter";
export class cmnS implements IEffectsLayerInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;

  size:number = 0;
  version:number = 0;
  visible:boolean = false;

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, length?:number, header?:Header) {
    this._offset = stream.tell();
    this.size = stream.readUint32();
    this.version = stream.readUint32();

    this.visible = !!stream.readUint8();

    // unused
    stream.seek(2);

    this._length = stream.tell() - this._offset;
  }


  write(stream:StreamWriter) {
    stream.writeUint32(7);
    stream.writeUint32(0);
    stream.writeUint8(1);
    stream.writeUint16(0);
  }

  getLength():number {
    return 11;
  }
}
