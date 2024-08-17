import * as _ from 'lodash';
import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {Descriptor, IDescriptorItem} from "../Descriptor";
import {StreamWriter} from "../StreamWriter";
import {DescriptorUtils} from "../DescriptorUtils";
import {IPatternRef} from "../../../Effects/GLTypes";
import {PatternSettingsDefault} from "../../../Effects/GLDefaults";

interface IPatternSettings {
  pattern : IPatternRef;
  scale : number;
  phase : { x : number, y : number };
  linkWithLayer : boolean;
}


export class PtFl implements IAdditionalLayerInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;

  version:number = 0;
  descriptor:Descriptor = new Descriptor();
  settings : IPatternSettings = _.cloneDeep(PatternSettingsDefault);

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  static create(settings:IPatternSettings) {
    let ptfl = new PtFl();
    ptfl.settings = settings;
    ptfl.descriptor = new Descriptor();
    ptfl.descriptor.name = "\u0000";
    ptfl.descriptor.classId = "null";
    ptfl.descriptor.item = [
      { key : "phase", type : "Objc", data : DescriptorUtils.setPhase(ptfl.settings.phase)},
      { key : "Algn", type : "bool", data : DescriptorUtils.setBool(ptfl.settings.linkWithLayer)},
      { key : "Scl ", type : "UntF", data : DescriptorUtils.setUntf(ptfl.settings.scale, "#Prc")},
      { key : "Ptrn", type : "Objc", data : DescriptorUtils.setPattern(ptfl.settings.pattern)}
    ];
    ptfl.descriptor.items = 4;
    return ptfl;
  }

  parse(stream:StreamReader, length?:number, header?:Header) {
    this._offset = stream.tell();

    this.version = stream.readUint32();
    this.descriptor = new Descriptor();
    this.descriptor.parse(stream);

    this.settings = { pattern : { name : "Default", uuid : null }, linkWithLayer : true, scale : 1.0, phase : { x : 0, y : 0} };
    this.descriptor.item.forEach((di:IDescriptorItem)=> {
      di.key === "phase" && (this.settings.phase = DescriptorUtils.getPhase(di));
      di.key === "Algn" && (this.settings.linkWithLayer = DescriptorUtils.getBool(di));
      di.key === "Scl " && (this.settings.scale = DescriptorUtils.getUntf(di));
      di.key === "Ptrn" && (this.settings.pattern = DescriptorUtils.getPattern(di));
    });

    this._length = stream.tell() - this._offset;
  }


  write(stream:StreamWriter):void {
    stream.writeUint32(16);
    this.descriptor.write(stream);
  }

}