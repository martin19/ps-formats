import * as _ from 'lodash';
import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {StreamWriter} from "../StreamWriter";
import {Descriptor, IDescriptorItem} from "../Descriptor";
import {DescriptorUtils} from "../DescriptorUtils";
import {Objc} from "../Descriptor/Objc";
import {VlLs} from "../Descriptor/VlLs";
import {
  BlendMode,
  GradientStyle,
  IStrokeStyleSettings,
  LineAlignmentType,
  LineCapType,
  LineJoinType
} from "../../../Effects/GLTypes";
import {IGradientSettings, IPatternSettings, ISolidColorSettings} from "../../../Adjustments/GLAdjustmentTypes";
import {SolidColorSettingsDefault, StrokeStyleSettingsDefault} from "../../../Effects/GLDefaults";

export class vstk implements IAdditionalLayerInfoBlock {
  private _offset : number = 0;
  private _length : number = 0;

  key : number = 0;
  version : number = 16;
  descriptor:Descriptor = new Descriptor();
  strokeStyleSettings:IStrokeStyleSettings = _.cloneDeep(StrokeStyleSettingsDefault);

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  static create(sss:IStrokeStyleSettings):vstk {
    const _vstk = new vstk();

    const descriptor = new Descriptor();
    descriptor.classId = "strokeStyle";
    descriptor.name = "\u0000";
    descriptor.item = [];
    if(sss.version !== undefined)
      descriptor.item.push({ key : "strokeStyleVersion", type : "long", data : DescriptorUtils.setLong(sss.version) });
    if(sss.strokeEnabled !== undefined)
      descriptor.item.push({ key : "strokeEnabled", type : "bool", data : DescriptorUtils.setBool(sss.strokeEnabled) });
    if(sss.fillEnabled !== undefined)
      descriptor.item.push({ key : "fillEnabled", type : "bool", data : DescriptorUtils.setBool(sss.fillEnabled) });
    if(sss.lineWidth !== undefined)
      descriptor.item.push({ key : "strokeStyleLineWidth", type : "UntF", data : DescriptorUtils.setUntf(sss.lineWidth, "#Pnt") });
    if(sss.lineDashOffset !== undefined)
      descriptor.item.push({ key : "strokeStyleLineDashOffset", type : "UntF", data : DescriptorUtils.setUntf(sss.lineDashOffset, "#Pnt") });
    if(sss.miterLimit !== undefined)
      descriptor.item.push({ key : "strokeStyleMiterLimit", type : "doub", data : DescriptorUtils.setDoub(sss.miterLimit) });
    if(sss.lineCapType !== undefined)
      descriptor.item.push({ key : "strokeStyleLineCapType", type : "enum", data : DescriptorUtils.setEnum("strokeStyleLineCapType", sss.lineCapType) });
    if(sss.lineJoinType !== undefined)
      descriptor.item.push({ key : "strokeStyleLineJoinType", type : "enum", data : DescriptorUtils.setEnum("strokeStyleLineJoinType", sss.lineJoinType) });
    if(sss.lineAlignment !== undefined)
      descriptor.item.push({ key : "strokeStyleLineAlignment", type : "enum", data : DescriptorUtils.setEnum("strokeStyleLineAlignment", sss.lineAlignment) });
    if(sss.scaleLock !== undefined)
      descriptor.item.push({ key : "strokeStyleScaleLock", type : "bool", data : DescriptorUtils.setBool(sss.scaleLock) });
    if(sss.strokeAdjust !== undefined)
      descriptor.item.push({ key : "strokeStyleStrokeAdjust", type : "bool", data : DescriptorUtils.setBool(sss.strokeAdjust) });
    if(sss.lineDashSet !== undefined) {
      const set = sss.lineDashSet.map(value => DescriptorUtils.setUntf(value, "#Nne"));
      descriptor.item.push({ key : "strokeStyleLineDashSet", type : "VlLs", data : DescriptorUtils.setVlLs(set, "UntF") });
    }
    if(sss.blendMode !== undefined)
      descriptor.item.push({ key : "strokeStyleBlendMode", type : "enum", data : DescriptorUtils.setEnum("BlnM", sss.blendMode) });
    if(sss.opacity !== undefined)
      descriptor.item.push({ key : "strokeStyleOpacity", type : "UntF", data : DescriptorUtils.setUntf(sss.opacity, "#Prc") });

    if(sss.content !== undefined) {
      const objc = new Objc();
      const desc = new Descriptor();
      desc.item = [];
      if(sss.content?.type === "solidColor" || sss.content?.type === "none") {
        const solidColorSettings = sss.content.data as ISolidColorSettings ?? SolidColorSettingsDefault;
        desc.classId = "solidColorLayer";
        desc.name = "\u0000";
        desc.item.push({ key : "Clr ", type : "Objc", data : DescriptorUtils.setColor(solidColorSettings.color)});
      } else if(sss.content?.type === "gradient") {
        const gradientSettings = sss.content.data as IGradientSettings;
        desc.classId = "gradientLayer";
        desc.name = "\u0000";
        desc.item.push({ key : "Angl", type : "UntF", data : DescriptorUtils.setUntf(gradientSettings.angle,"#Ang")});
        desc.item.push({ key : "Type", type : "enum", data : DescriptorUtils.setEnum("GrdT", gradientSettings.gradientStyle)});
        // descriptor.item.push({ key : "Md  ", type : "enum", data : DescriptorUtils.setEnum("BlnM", gradientSettings) });
        // descriptor.item.push({ key : "Opct", type : "UntF", data : DescriptorUtils.setUntf(style.gradientOverlay.opacity,"#Prc") });
        desc.item.push({ key : "Grad", type : "Objc", data : DescriptorUtils.setGradient(gradientSettings.gradient)});
        desc.item.push({ key :"Scl ", type : "UntF", data : DescriptorUtils.setUntf(gradientSettings.scale, "#Prc") });
        desc.item.push({ key : "Algn", type : "bool", data : DescriptorUtils.setBool(gradientSettings.alignWithLayer)});
        desc.item.push({ key : "Rvrs", type : "bool", data : DescriptorUtils.setBool(gradientSettings.reverse)});
        desc.item.push({ key : "Ofst", type : "Objc", data : DescriptorUtils.setPoint(gradientSettings.offset)});
      } else if(sss.content?.type === "pattern") {
        const patternSettings = sss.content.data as IPatternSettings;
        desc.classId = "patternLayer";
        desc.name = "\u0000";
        desc.item.push({ key :"Ptrn", type : "Objc", data : DescriptorUtils.setPattern(patternSettings.pattern) });
        desc.item.push({ key :"Scl ", type : "UntF", data : DescriptorUtils.setUntf(patternSettings.scale, "#Prc") });
        desc.item.push({ key :"Lnkd", type : "bool", data : DescriptorUtils.setBool(patternSettings.linkWithLayer)});
        desc.item.push({ key :"phase", type : "Objc", data : DescriptorUtils.setPhase(patternSettings.phase)});
      }

      objc.value = desc;
      descriptor.item.push({ key: "strokeStyleContent", type : "Objc", data : objc })
    }

    _vstk.descriptor = descriptor;
    return _vstk;
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

    this.version = stream.readUint32();
    this.descriptor = new Descriptor();
    this.descriptor.parse(stream);

    let sss = this.strokeStyleSettings;
    this.descriptor.item.forEach((di:IDescriptorItem)=> {
      if(di.key === "strokeStyleVersion") sss.version = DescriptorUtils.getLong(di);
      if(di.key === "strokeEnabled") sss.strokeEnabled = DescriptorUtils.getBool(di);
      if(di.key === "fillEnabled") sss.fillEnabled = DescriptorUtils.getBool(di);
      if(di.key === "strokeStyleLineWidth") sss.lineWidth = DescriptorUtils.getUntf(di);
      if(di.key === "strokeStyleLineDashOffset") sss.lineDashOffset = DescriptorUtils.getUntf(di);
      if(di.key === "strokeStyleMiterLimit") sss.miterLimit = DescriptorUtils.getDoub(di);
      if(di.key === "strokeStyleLineCapType") sss.lineCapType = DescriptorUtils.getEnum(di) as LineCapType;
      if(di.key === "strokeStyleLineJoinType") sss.lineJoinType = DescriptorUtils.getEnum(di) as LineJoinType;
      if(di.key === "strokeStyleLineAlignment") sss.lineAlignment = DescriptorUtils.getEnum(di) as LineAlignmentType;
      if(di.key === "strokeStyleScaleLock") sss.scaleLock = DescriptorUtils.getBool(di);
      if(di.key === "strokeStyleStrokeAdjust") sss.strokeAdjust = DescriptorUtils.getBool(di);
      if(di.key === "strokeStyleLineDashSet") {
        const lineDashSet:number[] = [];
        (di.data as VlLs).item.forEach((di2:IDescriptorItem) => {
          lineDashSet.push(DescriptorUtils.getUntf(di2));
        });
        sss.lineDashSet = lineDashSet;
      }
      if(di.key === "strokeStyleBlendMode") sss.blendMode = DescriptorUtils.getEnum(di) as BlendMode;
      if(di.key === "strokeStyleOpacity") sss.opacity = DescriptorUtils.getUntf(di);
      if(di.key === "strokeStyleContent") {
        let descriptor1 = (di.data as Objc).value;
        if(descriptor1.classId === "solidColorLayer") {
          sss.content = {
            type: "solidColor",
            data: solidColorSettings,
          };
          descriptor1.item.forEach((di:IDescriptorItem)=> {
            di.key === "Clr " && (solidColorSettings.color = DescriptorUtils.getColor(di));
          });
        }
        if(descriptor1.classId === "gradientLayer") {
          sss.content = {
            type: "gradient",
            data: gradientSettings,
          };
          descriptor1.item.forEach((di:IDescriptorItem)=> {
            if(di.key === "Angl") gradientSettings.angle = DescriptorUtils.getUntf(di);
            if(di.key === "Type") gradientSettings.gradientStyle = DescriptorUtils.getEnum(di) as GradientStyle;
            if(di.key === "Grad") gradientSettings.gradient = DescriptorUtils.getGradient(di);
            if(di.key === "Scl ") gradientSettings.scale = DescriptorUtils.getUntf(di);
            if(di.key === "Algn") gradientSettings.alignWithLayer = DescriptorUtils.getBool(di);
            if(di.key === "Rvrs") gradientSettings.reverse = DescriptorUtils.getBool(di);
            if(di.key === "Ofst") gradientSettings.offset = DescriptorUtils.getPoint(di);
          });
        }
        if(descriptor1.classId === "patternLayer") {
          sss.content = {
            type: "pattern",
            data: patternSettings
          };
          descriptor1.item.forEach((di:IDescriptorItem)=> {
            if(di.key === "phase") patternSettings.phase = DescriptorUtils.getPhase(di);
            if(di.key === "Algn") patternSettings.linkWithLayer = DescriptorUtils.getBool(di);
            if(di.key === "Scl ") patternSettings.scale = DescriptorUtils.getUntf(di);
            if(di.key === "Ptrn") patternSettings.pattern = DescriptorUtils.getPattern(di);
          });
        }
      }
      if(di.key === "strokeStyleResolution") sss.resolution = DescriptorUtils.getDoub(di);
    });
    this._length = stream.tell() - this._offset;
    // console.log(JSON.stringify(this))
  }


  write(stream:StreamWriter):void {
    //version
    stream.writeUint32(this.version);
    this.descriptor.write(stream);
  }
}