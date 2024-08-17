import * as _ from 'lodash';
import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {StreamWriter} from "../StreamWriter";
import {AdjustmentDefaultHueSaturation} from "../../../Adjustments/GLAdjustmentDefaults";

interface IHueRange {
  hue : number, //[-180,180]
  saturation : number, //[-1.0,+1.0]
  lightness : number, //[-1.0,+1.0]
  dropOffMin : number,
  rangeMin : number,
  rangeMax : number,
  dropOffMax : number,
}

interface IHSLSetting {
  hue : number;
  saturation : number;
  lightness : number;
}

interface IHueSaturationSettings {
  colorize : boolean;
  colorizeSetting : IHSLSetting;
  masterSetting : IHSLSetting;
  ranges : IHueRange[];
}

export class hue2 implements IAdditionalLayerInfoBlock {

  private _offset : number = 0;
  private _length : number = 0;

  version : number = 0;
  settings : IHueSaturationSettings = _.cloneDeep(AdjustmentDefaultHueSaturation);

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  static create(settings:IHueSaturationSettings) {
    let _hue2 = new hue2();
    _hue2.settings = settings;
    return _hue2;
  }

  parse(stream : StreamReader, length? : number, header? : Header) {
    this._offset = stream.tell();

    this.settings = {
      colorize : false,
      colorizeSetting : { hue : 0, saturation : 0, lightness : 0},
      masterSetting : { hue : 0, saturation : 0, lightness : 0},
      ranges : []
    };

    this.version = stream.readUint16();
    this.settings.colorize = stream.readUint8() == 1;
    stream.seek(1);
    this.settings.colorizeSetting = {
      hue : stream.readInt16(),
      saturation : stream.readInt16()/100.0,
      lightness : stream.readInt16()/100.0
    };
    this.settings.masterSetting = {
      hue : stream.readInt16(),
      saturation : stream.readInt16()/100.0,
      lightness : stream.readInt16()/100.0
    };
    for(let i = 0; i < 6;i++) {
      let hueRange = {
        dropOffMin : stream.readInt16(),
        rangeMin : stream.readInt16(),
        rangeMax : stream.readInt16(),
        dropOffMax : stream.readInt16(),
        hue : stream.readInt16(),
        saturation : stream.readInt16()/100.0,
        lightness : stream.readInt16()/100.0,
      };
      this.settings.ranges.push(hueRange);
    }

    this._length = stream.tell() - this._offset;
  }

  write(stream : StreamWriter) {
    stream.writeUint16(2); //version
    stream.writeUint8(this.settings.colorize ? 1 : 0);
    stream.writeUint8(0); //padding
    stream.writeInt16(this.settings.colorizeSetting.hue);
    stream.writeInt16(this.settings.colorizeSetting.saturation * 100.0);
    stream.writeInt16(this.settings.colorizeSetting.lightness * 100.0);
    stream.writeInt16(this.settings.masterSetting.hue);
    stream.writeInt16(this.settings.masterSetting.saturation * 100.0);
    stream.writeInt16(this.settings.masterSetting.lightness * 100.0);
    for(let i = 0; i < 6; i++) {
      stream.writeInt16(this.settings.ranges[i].dropOffMin);
      stream.writeInt16(this.settings.ranges[i].rangeMin);
      stream.writeInt16(this.settings.ranges[i].rangeMax);
      stream.writeInt16(this.settings.ranges[i].dropOffMax);
      stream.writeInt16(this.settings.ranges[i].hue);
      stream.writeInt16(this.settings.ranges[i].saturation * 100.0);
      stream.writeInt16(this.settings.ranges[i].lightness * 100.0);
    }
  }
}