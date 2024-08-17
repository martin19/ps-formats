import * as _ from 'lodash';
import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {Descriptor, IDescriptorItem} from "../Descriptor";
import {StreamWriter} from "../StreamWriter";
import {DescriptorUtils} from "../DescriptorUtils";
import {AdjustmentDefaultVibrance} from "../../../Adjustments/GLAdjustmentDefaults";

interface IVibranceSettings {
  vibrance : number;
  saturation : number;
}

export class vibA implements IAdditionalLayerInfoBlock {

  private _offset : number = 0;
  private _length : number = 0;

  version : number = 0;
  settings : IVibranceSettings = _.cloneDeep(AdjustmentDefaultVibrance);
  descriptor:Descriptor = new Descriptor();

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream : StreamReader, length? : number, header? : Header) {
    this._offset = stream.tell();

    this.settings = {
      vibrance : 0,
      saturation : 0
    };

    this.version = stream.readUint32();
    this.descriptor = new Descriptor();
    this.descriptor.parse(stream);

    this.descriptor.item.forEach((di:IDescriptorItem)=> {
      di.key === "vibrance" && (this.settings.vibrance = DescriptorUtils.getLong(di));
      di.key === "Strt" && (this.settings.saturation = DescriptorUtils.getLong(di));
    });

    this._length = stream.tell() - this._offset;
  }

  write(stream : StreamWriter) {
    //TODO:
    // stream.writeUint32(this.version);
    // this.descriptor.write(stream);
  }
  
  getLength() {
    //TODO:
    this._length = 100;
    return this._length;
  }

}