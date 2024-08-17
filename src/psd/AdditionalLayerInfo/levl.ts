import * as _ from 'lodash';
import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {StreamWriter} from "../StreamWriter";
import {AdjustmentDefaultLevels} from "../../../Adjustments/GLAdjustmentDefaults";

interface Levels {
  input : {
    min : number,
    gamma : number,
    max : number
  },
  output : {
    min : number,
    max : number
  }
}

export interface ILevelsSettings {
  levels : Levels[]
}

export class levl implements IAdditionalLayerInfoBlock {

  private _offset : number = 0;
  private _length : number = 0;

  version : number = 0;
  settings : ILevelsSettings = _.cloneDeep(AdjustmentDefaultLevels);

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }
  static create(settings:ILevelsSettings) {
    let _levl = new levl();
    _levl.settings = settings;
    return _levl;
  }

  parse(stream : StreamReader, length? : number, header? : Header) {
    this._offset = stream.tell();

    this.version = stream.readUint16();

    this.settings = {
      levels : []
    };
    for(let i = 0; i < 29; i++) {
      let levels = { input : { min : 0, gamma : 0, max : 0 }, output : { min : 0, max : 0}};
      levels.input.min = stream.readUint16();
      levels.input.max = stream.readUint16();
      levels.output.min = stream.readUint16();
      levels.output.max = stream.readUint16();
      levels.input.gamma = stream.readUint16()/100.0;
      this.settings.levels.push(levels);
    }

    this._length = stream.tell() - this._offset;
  }

  write(stream : StreamWriter) {
    stream.writeUint16(2);
    for(let i = 0; i < 29; i++) {
      let levels = this.settings.levels[i];
      if(!levels) levels = { input : { min : 0, gamma : 0, max : 0 }, output : { min : 0, max : 0}};
      stream.writeUint16(levels.input.min);
      stream.writeUint16(levels.input.max);
      stream.writeUint16(levels.output.min);
      stream.writeUint16(levels.output.max);
      stream.writeUint16(levels.input.gamma*100);
    }
  }
}