import * as _ from 'lodash';
import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {StreamWriter} from "../StreamWriter";
import {Descriptor, IDescriptorItem} from "../Descriptor";
import {DescriptorUtils} from "../DescriptorUtils";
import {GradientStyle, IFillStyleSettings} from "../../../Effects/GLTypes";
import {IGradientSettings, IPatternSettings, ISolidColorSettings} from "../../../Adjustments/GLAdjustmentTypes";
import {FillStyleSettingsDefault, SolidColorSettingsDefault} from "../../../Effects/GLDefaults";

export class vscg implements IAdditionalLayerInfoBlock {

  private _offset : number = 0;
  private _length : number = 0;

  key : "PtFl"|"GdFl"|"SoCo" = "SoCo";
  version : number = 16;
  descriptor:Descriptor = new Descriptor();
  fillStyleSettings : IFillStyleSettings = _.cloneDeep(FillStyleSettingsDefault);

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  static create(fillStyleSettings : IFillStyleSettings) {
    const _vscg = new vscg();

    const descriptor = new Descriptor();
    descriptor.item = [];
    if(fillStyleSettings.content?.type === "solidColor" || fillStyleSettings.content?.type === "none") {
      const solidColorSettings = fillStyleSettings.content.data as ISolidColorSettings ?? SolidColorSettingsDefault;
      _vscg.key = "SoCo";
      descriptor.classId = "null";
      descriptor.name = "\u0000";
      descriptor.item.push({ key : "Clr ", type : "Objc", data : DescriptorUtils.setColor(solidColorSettings.color)});
    } else if(fillStyleSettings.content?.type === "gradient") {
      const gradientSettings = fillStyleSettings.content.data as IGradientSettings;
      _vscg.key = "GdFl";
      descriptor.classId = "null";
      descriptor.name = "\u0000";
      descriptor.item.push({ key : "Angl", type : "UntF", data : DescriptorUtils.setUntf(gradientSettings.angle,"#Ang")});
      descriptor.item.push({ key : "Type", type : "enum", data : DescriptorUtils.setEnum("GrdT", gradientSettings.gradientStyle)});
      // descriptor.item.push({ key : "Md  ", type : "enum", data : DescriptorUtils.setEnum("BlnM", gradientSettings) });
      // descriptor.item.push({ key : "Opct", type : "UntF", data : DescriptorUtils.setUntf(style.gradientOverlay.opacity,"#Prc") });
      descriptor.item.push({ key : "Grad", type : "Objc", data : DescriptorUtils.setGradient(gradientSettings.gradient)});
      descriptor.item.push({ key : "Scl ", type : "UntF", data : DescriptorUtils.setUntf(gradientSettings.scale, "#Prc") });
      descriptor.item.push({ key : "Algn", type : "bool", data : DescriptorUtils.setBool(gradientSettings.alignWithLayer)});
      descriptor.item.push({ key : "Rvrs", type : "bool", data : DescriptorUtils.setBool(gradientSettings.reverse)});
      descriptor.item.push({ key : "Ofst", type : "Objc", data : DescriptorUtils.setPoint(gradientSettings.offset)});
      descriptor.item.push({ key : "Dthr", type : "bool", data : DescriptorUtils.setBool(gradientSettings.dither)});
    } else if(fillStyleSettings.content?.type === "pattern") {
      _vscg.key = "PtFl";
      const patternSettings = fillStyleSettings.content.data as IPatternSettings;
      descriptor.classId = "null";
      descriptor.name = "\u0000";
      descriptor.item.push({ key :"Ptrn", type : "Objc", data : DescriptorUtils.setPattern(patternSettings.pattern) });
      descriptor.item.push({ key :"Scl ", type : "UntF", data : DescriptorUtils.setUntf(patternSettings.scale, "#Prc") });
      descriptor.item.push({ key :"Lnkd", type : "bool", data : DescriptorUtils.setBool(patternSettings.linkWithLayer)});
      descriptor.item.push({ key :"phase", type : "Objc", data : DescriptorUtils.setPhase(patternSettings.phase)});
    }

    _vscg.descriptor = descriptor;
    return _vscg;
  }

  parse(stream:StreamReader, length?:number, header?:Header) {
    const gradientSettings:IGradientSettings = {
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
    const patternSettings:IPatternSettings = {
      pattern : { name : "Default", uuid : null },
      linkWithLayer : true,
      scale : 1.0,
      phase : { x : 0, y : 0}
    };
    const solidColorSettings:ISolidColorSettings = {
      color : { r: 0, g : 0, b : 0}
    };

    this._offset = stream.tell();

    this.key = stream.readString(4) as "PtFl"|"GdFl"|"SoCo";
    this.version = stream.readUint32();
    this.descriptor = new Descriptor();
    this.descriptor.parse(stream);

    let fss = this.fillStyleSettings;
    if(this.key === "PtFl") {
      this.fillStyleSettings = {
        content : {
          type : "pattern",
          data : patternSettings
        }
      };
      this.descriptor.item.forEach((di:IDescriptorItem)=> {
        if(di.key === "Scl ") patternSettings.scale = DescriptorUtils.getUntf(di);
        if(di.key === "Ptrn") patternSettings.pattern = DescriptorUtils.getPattern(di);
      });
    } else if(this.key === "GdFl") {
      this.fillStyleSettings = {
        content : {
          type : "gradient",
          data : gradientSettings
        }
      };
      this.descriptor.item.forEach((di:IDescriptorItem)=> {
        if(di.key === "Angl") gradientSettings.angle = DescriptorUtils.getUntf(di);
        if(di.key === "Type") gradientSettings.gradientStyle = DescriptorUtils.getEnum(di) as GradientStyle;
        if(di.key === "Grad") gradientSettings.gradient = DescriptorUtils.getGradient(di);
        if(di.key === "Scl ") gradientSettings.scale = DescriptorUtils.getUntf(di);
        if(di.key === "Algn") gradientSettings.alignWithLayer = DescriptorUtils.getBool(di);
        if(di.key === "Rvrs") gradientSettings.reverse = DescriptorUtils.getBool(di);
        if(di.key === "Ofst") gradientSettings.offset = DescriptorUtils.getPoint(di);
      });
    } else if(this.key === "SoCo") {
      this.fillStyleSettings = {
        content : {
          type : "solidColor",
          data : solidColorSettings
        }
      };
      this.descriptor.item.forEach((di:IDescriptorItem)=> {
        if (di.key === "Clr ") solidColorSettings.color = DescriptorUtils.getColor(di);
      });
    }
    this._length = stream.tell() - this._offset;
    // console.log(JSON.stringify(this))
  }


  write(stream:StreamWriter):void {
    //version
    stream.writeString(this.key);
    stream.writeUint32(this.version);
    this.descriptor.write(stream);
  }
}