import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {Descriptor} from "../Descriptor";
import {StreamWriter} from "../StreamWriter";
import {DescriptorUtils} from "../DescriptorUtils";
import {PtFl} from "./PtFl";

export interface IBrightnessContrastSettings {
  brightness : number;
  contrast : number;
  mean : number;
  labonly : boolean;
}

export class brit implements IAdditionalLayerInfoBlock {

  private _offset : number = 0;
  private _length : number = 0;

  settings : IBrightnessContrastSettings = {
    brightness : 0,
    contrast : 0,
    mean : 0,
    labonly : false
  };

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  static create(settings:IBrightnessContrastSettings) {
    let _brit = new brit();
    _brit.settings = settings;
    return _brit;
  }

  parse(stream : StreamReader, length? : number, header? : Header) {
    this._offset = stream.tell();

    this.settings = {
      brightness : stream.readInt16(),
      contrast : stream.readUint16(),
      mean : stream.readInt16(),
      labonly : stream.readUint8() == 1
    };
    stream.seek(1);
  }

  write(stream : StreamWriter) {
    stream.writeInt16(this.settings.brightness);
    stream.writeUint16(this.settings.contrast);
    stream.writeInt16(this.settings.mean);
    stream.writeUint8(this.settings.labonly ? 1 : 0);
  }
}