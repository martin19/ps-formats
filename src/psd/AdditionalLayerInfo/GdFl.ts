import * as _ from 'lodash';
import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {Descriptor, IDescriptorItem} from "../Descriptor";
import {StreamWriter} from "../StreamWriter";
import {DescriptorUtils} from "../DescriptorUtils";
import {GradientStyle, IGradientDef} from "../../../Effects/GLTypes";
import {GradientSettingsDefault} from "../../../Effects/GLDefaults";

interface IGradientSettings {
  gradient : IGradientDef;
  gradientStyle : GradientStyle;
  angle : number;
  scale : number;
  reverse : boolean;
  dither : boolean;
  alignWithLayer : boolean;
  offset : { x : number, y : number };
}

export class GdFl implements IAdditionalLayerInfoBlock {

  private _offset : number = 0;
  private _length : number = 0;

  version : number = 0;
  descriptor : Descriptor = new Descriptor();
  settings : IGradientSettings = _.cloneDeep(GradientSettingsDefault);

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  static create(settings:IGradientSettings) {
    let gdfl = new GdFl();
    gdfl.settings = settings;
    gdfl.descriptor = new Descriptor();
    gdfl.descriptor.name = "\u0000";
    gdfl.descriptor.classId = "null";
    gdfl.descriptor.item = [
      { key : "Angl", type : "UntF", data : DescriptorUtils.setUntf(gdfl.settings.angle,"#Ang")},
      { key : "Type", type : "enum", data : DescriptorUtils.setEnum("GrdT", gdfl.settings.gradientStyle)},
      { key : "Grad", type : "Objc", data : DescriptorUtils.setGradient(gdfl.settings.gradient)},
      { key : "Scl ", type : "UntF", data : DescriptorUtils.setUntf(gdfl.settings.scale, "#Prc")},
      { key : "Algn", type : "bool", data : DescriptorUtils.setBool(gdfl.settings.alignWithLayer)},
      { key : "Rvrs", type : "bool", data : DescriptorUtils.setBool(gdfl.settings.reverse)},
      { key : "Ofst", type : "Objc", data : DescriptorUtils.setPoint(gdfl.settings.offset)}
    ];
    gdfl.descriptor.items = 6;
    return gdfl;
  }

  parse(stream : StreamReader, length? : number, header? : Header) {
    this._offset = stream.tell();

    this.version = stream.readUint32();
    this.descriptor = new Descriptor();
    this.descriptor.parse(stream);

    this.settings = {
      gradient : {
        name : "Default",
        colorStops:[],
        alphaStops:[],
      },
      gradientStyle : "linear",
      angle : 0,
      scale : 1.0,
      reverse : false,
      dither : false,
      alignWithLayer : true,
      offset : { x : 0, y : 0 }
    };
    this.descriptor.item.forEach((di:IDescriptorItem)=> {
      di.key === "Angl" && (this.settings.angle = DescriptorUtils.getUntf(di));
      di.key === "Type" && (this.settings.gradientStyle = DescriptorUtils.getEnum(di) as GradientStyle);
      di.key === "Grad" && (this.settings.gradient = DescriptorUtils.getGradient(di));
      di.key === "Scl " && (this.settings.scale = DescriptorUtils.getUntf(di));
      di.key === "Algn" && (this.settings.alignWithLayer = DescriptorUtils.getBool(di));
      di.key === "Rvrs" && (this.settings.reverse = DescriptorUtils.getBool(di));
      di.key === "Ofst" && (this.settings.offset = DescriptorUtils.getPoint(di))
    });

    this._length = stream.tell() - this._offset;
  }

  write(stream : StreamWriter) {
    stream.writeUint32(16);
    this.descriptor.write(stream);
  }
}