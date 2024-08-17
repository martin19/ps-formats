import * as _ from 'lodash';
import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {StreamWriter} from "../StreamWriter";
import {AdjustmentDefaultSelectiveColor} from "../../../Adjustments/GLAdjustmentDefaults";

interface ISelectiveColorSettings {
  method : "relative"|"absolute";
  colors : {
    cyan : number;
    magenta : number;
    yellow : number;
    black : number;
  }[]
}

export class selc implements IAdditionalLayerInfoBlock {

  private _offset : number = 0;
  private _length : number = 0;

  version : number = 0;
  settings : ISelectiveColorSettings = _.cloneDeep(AdjustmentDefaultSelectiveColor);

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  static create(settings:ISelectiveColorSettings) {
    let _selc = new selc();
    _selc.settings = settings;
    return _selc;
  }

  parse(stream : StreamReader, length? : number, header? : Header) {
    this._offset = stream.tell();

    this.version = stream.readUint16();
    this.settings = {
      method : stream.readUint16() == 0 ? "relative" : "absolute",
      colors : []
    };
    for(let i = 0; i < 10; i++) {
      this.settings.colors.push({
        cyan : stream.readInt16(),
        magenta : stream.readInt16(),
        yellow : stream.readInt16(),
        black : stream.readInt16()
      });
    }

    this._length = stream.tell() - this._offset;
  }

  write(stream : StreamWriter) {
    stream.writeUint16(1); //version
    stream.writeUint16(this.settings.method === "relative" ? 0 : 1);
    for(let i = 0; i < 10; i++) {
      stream.writeInt16(this.settings.colors[i].cyan);
      stream.writeInt16(this.settings.colors[i].magenta);
      stream.writeInt16(this.settings.colors[i].yellow);
      stream.writeInt16(this.settings.colors[i].black);
    }
  }
}