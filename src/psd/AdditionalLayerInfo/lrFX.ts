import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {EffectsLayerInfoBlock, IEffectsLayerInfoBlock} from "./EffectsLayer/EffectsLayerInfoBlock";
import {StreamWriter} from "../StreamWriter";
export class lrFX implements IAdditionalLayerInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;

  version:number = 0;
  count:number = 0;
  effect:Array<{key:string, effect:IEffectsLayerInfoBlock}> = [];
  key : string = "";

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, length?:number, header?:Header) {
    var signature:string;
    var key:string;
    var effect:IEffectsLayerInfoBlock;
    var i:number;

    this._offset = stream.tell();

    this.version = stream.readUint16();
    this.count = stream.readUint16();
    this.effect = [];

    for (i = 0; i < this.count; ++i) {
      // signature
      signature = stream.readString(4);
      if (signature !== '8BIM') {
        console.warn('invalid signature:', signature);
        break;
      }

      this.key = key = stream.readString(4);
      if (typeof EffectsLayerInfoBlock[this.key] === 'function') {
        effect = new (EffectsLayerInfoBlock[this.key])();
        effect.parse(stream);
        this.effect[i] = {
          key: key,
          effect: effect
        };
      } else {
        console.warn('detect unknown key:', key);
        break;
      }
    }

    this._length = stream.tell() - this._offset;
  }

  write(stream:StreamWriter) {
    stream.writeUint16(this.version);
    stream.writeUint16(this.effect.length);
    for(var i = 0; i < this.effect.length;i++) {
      stream.writeString("8BIM");
      stream.writeString(this.effect[i].key);
      this.effect[i].effect.write(stream);
    }
  }


  getLength():number {
    var length = 4;
    for(var i = 0; i < this.effect.length; i++) {
      length += 4 + this.effect[i].effect.getLength();
    }
    return length;
  }
}