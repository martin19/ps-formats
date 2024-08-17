import * as _ from 'lodash';
import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {Descriptor, IDescriptorItem} from "../Descriptor";
import {StreamWriter} from "../StreamWriter";
import {DescriptorUtils} from "../DescriptorUtils";
import {RGB} from "../../../Utils/Colr";
import {SolidColorSettingsDefault} from "../../../Effects/GLDefaults";

interface ISolidColorSettings {
  color : RGB;
}

export class SoCo implements IAdditionalLayerInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;

  version:number = 0;
  descriptor:Descriptor = new Descriptor();
  settings : ISolidColorSettings = _.cloneDeep(SolidColorSettingsDefault);

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  static create(settings:ISolidColorSettings) {
    let soco = new SoCo();
    soco.settings = settings;
    soco.descriptor = new Descriptor();
    soco.descriptor.name = "\u0000";
    soco.descriptor.classId = "null";
    soco.descriptor.item = [{ key : "Clr ", type : "Objc", data : DescriptorUtils.setColor(soco.settings.color)}];
    soco.descriptor.items = 1;
    return soco;
  }

  parse(stream:StreamReader, length?:number, header?:Header) {
    this._offset = stream.tell();

    this.settings = {
      color : { r: 0, g : 0, b : 0}
    };

    this.version = stream.readUint32();
    this.descriptor = new Descriptor();
    this.descriptor.parse(stream);

    this.descriptor.item.forEach((di:IDescriptorItem)=> {
      di.key === "Clr " && (this.settings.color = DescriptorUtils.getColor(di));
    });

    this._length = stream.tell() - this._offset;
  }


  write(stream:StreamWriter):void {
    //version
    stream.writeUint32(16);
    this.descriptor.write(stream);
  }

}