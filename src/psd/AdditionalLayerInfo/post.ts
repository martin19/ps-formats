import * as _ from 'lodash';
import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {StreamWriter} from "../StreamWriter";
import {AdjustmentDefaultPosterize} from "../../../Adjustments/GLAdjustmentDefaults";

interface IPosterizeSettings {
  levels : number;
}

export class post implements IAdditionalLayerInfoBlock {

  private _offset : number = 0;
  private _length : number = 0;

  settings : IPosterizeSettings = _.cloneDeep(AdjustmentDefaultPosterize);

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  static create(settings:IPosterizeSettings) {
    let _post = new post();
    _post.settings = settings;
    return _post;
  }

  parse(stream : StreamReader, length? : number, header? : Header) {
    this._offset = stream.tell();

    this.settings = {
      levels : stream.readUint16()
    };
    stream.seek(2);

    this._length = stream.tell() - this._offset;
  }

  write(stream : StreamWriter) {
    stream.writeUint16(this.settings.levels);
  }
  
  getLength() {
    this._length = 4;
    return this._length;
  }

}