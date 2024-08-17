import {Header} from "../../Header";
import {StreamReader} from "../../StreamReader";
import {IEffectsLayerInfoBlock} from "./EffectsLayerInfoBlock";
import {StreamWriter} from "../../StreamWriter";
export class isdw implements IEffectsLayerInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;

  size:number = 0;
  version:number = 0;
  blur:number = 0;
  intensity:number = 0;
  angle:number = 0;
  distance:number = 0;
  color:number[] = [];
  signature:string = "";
  blend:string = "";
  enabled:boolean = false;
  use:boolean = false;
  opacity:number = 0;
  nativeColor:number[] = [];


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

    this.blur = stream.readInt32();
    this.intensity = stream.readInt32();
    this.angle = stream.readInt32();
    this.distance = stream.readInt32();

    stream.seek(2);
    this.color = [
      stream.readUint32(),
      stream.readUint32()
    ];

    this.signature = stream.readString(4);
    this.blend = stream.readString(4);

    this.enabled = !!stream.readUint8();
    this.use = !!stream.readUint8();

    this.opacity = stream.readUint8();

    stream.seek(2);
    this.nativeColor = [
      stream.readUint32(),
      stream.readUint32()
    ];

    this._length = stream.tell() - this._offset;
  }


  write(stream:StreamWriter) {
    stream.writeUint32(51);
    stream.writeUint32(2);
    stream.writeInt32(this.blur);
    stream.writeInt32(this.intensity);
    stream.writeInt32(this.angle);
    stream.writeInt32(this.distance);

    stream.writeUint16(0);
    for(var i = 0; i < 4; i++) {
      stream.writeUint16(this.color[i]);
    }

    stream.writeUint8(this.enabled ? 1 : 0);
    stream.writeUint8(this.use ? 1 : 0);
    stream.writeUint8(this.opacity);
    stream.writeUint16(0);
    for(var i = 0; i < 4; i++) {
      stream.writeUint16(this.nativeColor[i]);
    }
  }

  getLength():number {
    return 55;
  }
}