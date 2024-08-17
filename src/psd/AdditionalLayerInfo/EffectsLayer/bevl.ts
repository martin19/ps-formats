import {Header} from "../../Header";
import {StreamReader} from "../../StreamReader";
import {IEffectsLayerInfoBlock} from "./EffectsLayerInfoBlock";
import {StreamWriter} from "../../StreamWriter";
export class bevl implements IEffectsLayerInfoBlock {

  private _offset : number = 0;
  private _length : number = 0;

  size : number = 0;
  version : number = 0;
  angle : number = 0;
  strength : number = 0;
  blur : number = 0;
  highlightBlendModeSignature : string = "";
  highlightBlendModeKey : string = "";
  shadowBlendModeSignature : string = "";
  shadowBlendModeKey : string = "";
  highlightColor : number[] = []; //4
  bevelStyle : number = 0;
  highlightOpacity : number = 0;
  shadowOpacity : number = 0;
  shadowColor : number[] = []; //4
  enabled : boolean = false;
  use :boolean = false;
  up : boolean = false;
  readHighlightColor : number[] = [];
  readShadowColor : number[] = [];

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream : StreamReader, length? : number, header? : Header) {
    this._offset = stream.tell();
    this.size = stream.readUint32();
    this.version = stream.readUint32();

    this.angle = stream.readInt32();
    this.strength = stream.readInt32();
    this.blur = stream.readInt32();

    this.highlightBlendModeSignature = stream.readString(4);
    this.highlightBlendModeKey = stream.readString(4);
    this.shadowBlendModeSignature = stream.readString(4);
    this.shadowBlendModeKey = stream.readString(4);

    stream.seek(2);
    this.highlightColor = [
      stream.readUint32(),
      stream.readUint32()
    ];
    stream.seek(2);
    this.shadowColor = [
      stream.readUint32(),
      stream.readUint32()
    ];

    this.bevelStyle = stream.readUint8();

    this.highlightOpacity = stream.readUint8();
    this.shadowOpacity = stream.readUint8();

    this.enabled = !!stream.readUint8();
    this.use = !!stream.readUint8();
    this.up = !!stream.readUint8();

    // version 2 only
    if (this.version === 2) {
      stream.seek(2);
      this.readHighlightColor = [
        stream.readUint32(),
        stream.readUint32()
      ];

      stream.seek(2);
      this.readShadowColor = [
        stream.readUint32(),
        stream.readUint32()
      ];
    }

    this._length = stream.tell() - this._offset;
  }


  write(stream:StreamWriter) {
    stream.writeUint32(78);
    stream.writeUint32(2);
    stream.writeInt32(this.angle);
    stream.writeInt32(this.strength);
    stream.writeInt32(this.blur);
    stream.writeString(this.highlightBlendModeSignature);
    stream.writeString(this.highlightBlendModeKey);
    stream.writeString(this.shadowBlendModeSignature);
    stream.writeString(this.shadowBlendModeKey);

    stream.writeUint16(0);
    for(var i = 0; i < 4; i++) {
      stream.writeUint16(this.highlightColor[i]);
    }
    stream.writeUint16(0);
    for(var i = 0; i < 4; i++) {
      stream.writeUint16(this.shadowColor[i]);
    }

    stream.writeUint8(this.bevelStyle);
    stream.writeUint8(this.highlightOpacity);
    stream.writeUint8(this.shadowOpacity);

    stream.writeUint8(this.enabled ? 1 : 0);
    stream.writeUint8(this.use ? 1 : 0);
    stream.writeUint8(this.up ? 1 : 0);

    if(this.version === 2) {
      stream.writeUint16(0);
      for(var i = 0; i < 4; i++) {
        stream.writeUint16(this.readHighlightColor[i]);
      }
      stream.writeUint16(0);
      for(var i = 0; i < 4; i++) {
        stream.writeUint16(this.readShadowColor[i]);
      }
    }
  }

  getLength():number {
    return 82;
  }
}