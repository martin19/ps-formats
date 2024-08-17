import * as _ from 'lodash';
import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {StreamWriter} from "../StreamWriter";
import {AdjustmentDefaultThreshold} from "../../../Adjustments/GLAdjustmentDefaults";

interface IThresholdSettings {
  threshold : number;
}

export class thrs implements IAdditionalLayerInfoBlock {

  private _offset : number = 0;
  private _length : number = 0;

  settings : IThresholdSettings = _.cloneDeep(AdjustmentDefaultThreshold);

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  static create(settings:IThresholdSettings) {
    let _thrs = new thrs();
    _thrs.settings = settings;
    return _thrs;
  }

  parse(stream : StreamReader, length? : number, header? : Header) {
    this._offset = stream.tell();

    this.settings = {
      threshold : stream.readUint16()
    };
    stream.seek(2);

    this._length = stream.tell() - this._offset;
  }

  write(stream : StreamWriter) {
    stream.writeUint16(this.settings.threshold);
  }
}