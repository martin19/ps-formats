import * as _ from 'lodash';
import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {StreamWriter} from "../StreamWriter";
import {AdjustmentDefaultExposure} from "../../../Adjustments/GLAdjustmentDefaults";

interface IExposureSettings {
  exposure : number;
  offset : number;
  gamma : number;
}

export class expA implements IAdditionalLayerInfoBlock {

  private _offset : number = 0;
  private _length : number = 0;

  version : number = 0;
  settings : IExposureSettings = _.cloneDeep(AdjustmentDefaultExposure);

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  static create(settings:IExposureSettings) {
    let _expa = new expA();
    _expa.settings = settings;
    return _expa;
  }

  parse(stream : StreamReader, length? : number, header? : Header) {
    this._offset = stream.tell();

    this.settings = {
      exposure : 0,
      offset : 0,
      gamma : 1.0
    };

    this.version = stream.readUint16();
    this.settings.exposure = stream.readFloat32();
    this.settings.offset = stream.readFloat32();
    this.settings.gamma = stream.readFloat32();

    this._length = stream.tell() - this._offset;
  }

  write(stream : StreamWriter) {
    stream.writeUint16(1);
    stream.writeFloat32(this.settings.exposure);
    stream.writeFloat32(this.settings.offset);
    stream.writeFloat32(this.settings.gamma);
  }
  
  getLength() {
    this._length = 18;
    return this._length;
  }

}