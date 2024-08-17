import {Descriptor, DescriptorItemType, IDescriptorItem} from "./Descriptor";
import {bool} from "./Descriptor/bool";
import {doub} from "./Descriptor/doub";
import {long} from "./Descriptor/long";
import {TEXT} from "./Descriptor/TEXT";
import {_enum} from "./Descriptor/enum";
import {deg2rad, rad2deg} from "../../Utils/Utils";
import {UntF} from "./Descriptor/UntF";
import {Objc} from "./Descriptor/Objc";
//import {IContourDef} from "../../Utils/Contour";
import {VlLs} from "./Descriptor/VlLs";
//import {IGradientDef, ColorStop, ColorStopType, AlphaStop} from "../../Utils/Gradient";
import {
  AlphaStop,
  BevelEmbossDirection,
  BevelEmbossStyle,
  BevelEmbossTechnique,
  BlendMode,
  Color,
  ColorStop,
  ColorStopType,
  EffectShadowOptions,
  FillType,
  GradientStyle,
  IContourDef,
  IGradientDef,
  ILayerEffectConfig,
  IPatternRef, IWarpSettings,
  PathBooleanOpArray,
  SourceGlow,
  StrokePosition,
  TechniqueGlow, WarpOrientation, WarpStyle
} from "../../Effects/GLTypes";
import {IDescriptorInfoBlock} from "./Descriptor/DescriptorInfoBlock";
import {Colr, HSV, RGB} from "../../Utils/Colr";
import * as _ from "lodash";
import {
  EffectDefaultBevelEmboss,
  EffectDefaultColorOverlay,
  EffectDefaultDropShadow,
  EffectDefaultGradientOverlay,
  EffectDefaultInnerGlow,
  EffectDefaultInnerShadow,
  EffectDefaultOuterGlow,
  EffectDefaultPatternOverlay,
  EffectDefaultSatin,
  EffectDefaultStroke,
  LayerEffectConfigDefault, WarpSettingsDefault
} from "../../Effects/GLDefaults";
import {PathRecord, PathRecordSubpathCombinationType, PathRecordType} from "./PathRecord";
import {PPath} from "../../PPath/PPath";
import {PPathSegment} from "../../PPath/PPathSegment";
import {PCompoundPath} from "../../PPath/PCompoundPath";
import {ObAr} from "./Descriptor/ObAr";
import {UnFl} from "./Descriptor/UnFl";

export class DescriptorUtils {
  static enumMap:{[s:string]:{ cp:string[], ps:string[]}} = {
    "BlendModeKey": {
      ps: "pass;norm;diss;dark;mul ;idiv;lbrn;dkCl;lite;scrn;div ;lddg;lgCl;over;sLit;hLit;vLit;lLit;pLit;hMix;diff;smud;fsub;fdiv;hue ;sat ;colr;lum ".split(";"),
      cp: "passThrough;normal;dissolve;darken;multiply;colorBurn;linearBurn;darkerColor;lighten;screen;colorDodge;linearDodge;lighterColor;overlay;softLight;hardLight;vividLight;linearLight;pinLight;hardMix;difference;exclusion;subtract;divide;hue;saturation;color;luminosity".split(";")
    },
    "BlnM": {
      ps: "Nrml;Dslv;Drkn;Mltp;CBrn;linearBurn;darkerColor;Lghn;Scrn;CDdg;linearDodge;lighterColor;Ovrl;SftL;HrdL;vividLight;linearLight;pinLight;hardMix;Dfrn;Xclu;blendSubtraction;blendDivide;H   ;Strt;Clr ;Lmns".split(";"),
      cp: "normal;dissolve;darken;multiply;colorBurn;linearBurn;darkerColor;lighten;screen;colorDodge;linearDodge;lighterColor;overlay;softLight;hardLight;vividLight;linearLight;pinLight;hardMix;difference;exclusion;subtract;divide;hue;saturation;color;luminosity".split(";")
    },
    "BETE": {
      ps: "SfBL;PrBL".split(";"),
      cp: "softer;precise".split(";"),
    },
    "bvlT": {
      ps: "SfBL;PrBL;Slmt".split(";"),
      cp: "smooth;chiselHard;chiselSoft".split(";")
    },
    "BESl": {
      ps: "InrB;OtrB;Embs;PlEb;strokeEmboss".split(";"),
      cp: "innerBevel;outerBevel;emboss;pillowEmboss;strokeEmboss".split(";")
    },
    "BESs": {
      ps: "In  ;Out ".split(";"),
      cp: "up;down".split(";")
    },
    "GrdT": {
      ps: "Lnr ;Rdl ;Angl;Rflc;Dmnd;shapeburst".split(";"),
      cp: "linear;radial;angular;mirror;diamond;shapeburst".split(";")
    },
    "FStl": {
      ps: "OutF;CtrF;InsF".split(";"),
      cp: "outside;center;inside".split(";")
    },
    "FrFl": {
      ps: "SClr;GrFl;Ptrn".split(";"),
      cp: "color;gradient;pattern".split(";")
    },
    "Clry": {
      ps: "UsrS;BckC;FrgC".split(";"),
      cp: "userStop;backgroundColor;foregroundColor".split(";")
    },
    "IGSr": {
      ps: "SrcC;SrcE".split(";"),
      cp: "center;edge".split(";")
    },
    "strokeStyleLineCapType": {
      ps: "strokeStyleRoundCap;strokeStyleSquareCap;strokeStyleButtCap".split(";"),
      cp: "strokeStyleRoundCap;strokeStyleSquareCap;strokeStyleButtCap".split(";")
    },
    "strokeStyleLineJoinType": {
      ps: "strokeStyleMiterJoin;strokeStyleRoundJoin;strokeStyleBevelJoin".split(";"),
      cp: "strokeStyleMiterJoin;strokeStyleRoundJoin;strokeStyleBevelJoin".split(";"),
    },
    "strokeStyleLineAlignment": {
      ps:"strokeStyleAlignInside;strokeStyleAlignCenter;strokeStyleAlignOutside".split(";"),
      cp:"strokeStyleAlignInside;strokeStyleAlignCenter;strokeStyleAlignOutside".split(";")
    },
    "warpStyle": {
      ps:"warpNone;warpCustom;warpArc;warpArcLower;warpArcUpper;warpArch;warpBulge;warpShellLower;warpShellUpper;warpFlag;warpWave;warpFish;warpRise;warpFisheye;warpInflate;warpSqueeze;warpTwist".split(";"),
      cp:"warpNone;warpCustom;warpArc;warpArcLower;warpArcUpper;warpArch;warpBulge;warpShellLower;warpShellUpper;warpFlag;warpWave;warpFish;warpRise;warpFisheye;warpInflate;warpSqueeze;warpTwist".split(";")
    },
    "Ornt": {
      ps:"Hrzn;Vrtc".split(";"),
      cp:"Hrzn;Vrtc".split(";")
    }
  };

  static convertEnumTypeToCp(type:string, value:string) {
    if (DescriptorUtils.enumMap[type] && DescriptorUtils.enumMap[type].ps.indexOf(value) >= 0) {
      return DescriptorUtils.enumMap[type].cp[DescriptorUtils.enumMap[type].ps.indexOf(value)];
    }
  }

  static convertEnumTypeToPs(type:string, value:string) {
    if (DescriptorUtils.enumMap[type] && DescriptorUtils.enumMap[type].cp.indexOf(value) >= 0) {
      return DescriptorUtils.enumMap[type].ps[DescriptorUtils.enumMap[type].cp.indexOf(value)];
    }
  }

  static getBool(item:IDescriptorItem):boolean {
    if (item) return (item.data as bool).value;
    return false;
  }

  static getDoub(item:IDescriptorItem):number {
    if (item) return (item.data as doub).value;
    return 0.0;
  }

  static getLong(item:IDescriptorItem):number {
    if (item) return (item.data as long).value;
    return 0;
  }

  static getText(item:IDescriptorItem):string {
    if (item) return (item.data as TEXT).string;
    return "";
  }

  static getUntf(item:IDescriptorItem, units?:string):number {
    let data = item.data as UntF;
    let u = typeof units === "string" ? units : data.units;
    if (u === "#Prc") {
      return data.value / 100.0;
    } else if (u === "#Pxl") {
      return data.value;
    } else if (u === "#Ang") {
      return deg2rad(data.value);
    } else if (u === "#Pnt") {
      return data.value; //TODO: include dpi ratio
    } else if (u === "#Nne") {
      return data.value;
    }
    return 0.0;
  }

  static getVlLs(item:IDescriptorItem):any[] {
    let data = item.data as VlLs;
    return data.item.map(value => {
      if(value.type === "doub") return DescriptorUtils.getDoub(value as IDescriptorItem);
      else if(value.type === "long") return DescriptorUtils.getLong(value as IDescriptorItem);
      else throw new Error(`type ${value.type} not supported in VlLs`);
    });
  }

  static getEnum(item:IDescriptorItem):string {
    let data = item.data as _enum;
    if (item) {
      if (DescriptorUtils.enumMap[data._type] && DescriptorUtils.enumMap[data._type].ps.indexOf(data._enum) >= 0) {
        return DescriptorUtils.enumMap[data._type].cp[DescriptorUtils.enumMap[data._type].ps.indexOf(data._enum)];
      }
    } else {
      throw new Error("Unknown enum value/type: " + data._type + "/" + data._enum);
    }
    return "";
  }

  static getPoint(item:IDescriptorItem):{ x:number, y:number} {
    let p:{ x:number, y:number} = {x: 0, y: 0};
    let desc = (item.data as Objc).value;
    for (let i of desc.item) {
      if(i.key === "Hrzn") p.x = DescriptorUtils.getUntf(i);
      else if(i.key === "Vrtc") p.y = DescriptorUtils.getUntf(i);
    }
    return p;
  }

  static getPnt(item:IDescriptorItem):{ w:number, h:number} {
    let p:{ w:number, h:number} = {w: 0, h: 0};
    let desc = (item.data as Objc).value;
    for (let i of desc.item) {
      if(i.key === "Wdth") p.w = DescriptorUtils.getDoub(i);
      else if(i.key === "Hght") p.h = DescriptorUtils.getDoub(i);
    }
    return p;
  }

  static getRctn(item:IDescriptorItem): { top:number, left:number, bottom:number, right:number } {
    let r: { top:number, left:number, bottom:number, right:number } = { top : 0, left : 0, bottom : 0, right : 0 };
    let desc = (item.data as Objc).value;
    for (let i of (desc.item as IDescriptorItem[])) {
      if(i.key === "Left") (r.left = DescriptorUtils.getUntf(i));
      if(i.key === "Top ") (r.top = DescriptorUtils.getUntf(i));
      if(i.key === "Btom") (r.bottom = DescriptorUtils.getUntf(i));
      if(i.key === "Rght") (r.right = DescriptorUtils.getUntf(i));
    }
    return r;
  }

  static getPhase(item:IDescriptorItem):{ x:number, y:number} {
    let p:{ x:number, y:number} = {x: 0, y: 0};
    let desc = (item.data as Objc).value;
    for (let i of (desc.item as IDescriptorItem[])) {
      i.key === "Hrzn" && (p.x = DescriptorUtils.getDoub(i));
      i.key === "Vrtc" && (p.y = DescriptorUtils.getDoub(i));
    }
    return p;
  }

  static getColor(item:IDescriptorItem):Color {
    let c:Partial<RGB&HSV> = {};
    let desc = (item.data as Objc).value;
    for (let i of (desc.item as IDescriptorItem[])) {
      i.key === "Rd  " && (c.r = DescriptorUtils.getDoub(i));
      i.key === "Grn " && (c.g = DescriptorUtils.getDoub(i));
      i.key === "Bl  " && (c.b = DescriptorUtils.getDoub(i));

      i.key === "H   " && (c.h = rad2deg(DescriptorUtils.getUntf(i)));
      i.key === "Strt" && (c.s = DescriptorUtils.getDoub(i));
      i.key === "Brgh" && (c.v = DescriptorUtils.getDoub(i));
    }

    if(c.r !== undefined && c.g !== undefined && c.b !== undefined) {
      return { r : c.r, g : c.g, b : c.b };
    } else if(c.h !== undefined && c.s !== undefined && c.v !== undefined) {
      return Colr.fromHsvObject(c as HSV).toRgbObject();
    }

    console.warn("unknown color format detected:" + JSON.stringify(desc));
    return { r : 0, g : 0, b : 0 };
  }

  static getContour(item:IDescriptorItem) {
    let contour:IContourDef = {name: "Custom", x: [], y: [], c: []};
    let desc = (item.data as Objc).value;
    for (let i of (desc.item as IDescriptorItem[])) {
      i.key == "Nm  " && (contour.name = DescriptorUtils.getText(i));
      if (i.key == "Crv ") {
        for (let j of (i.data as VlLs).item) {
          contour.c.push(true);
          for (let k of (j.data as Objc).value.item) {
            k.key === "Hrzn" && (contour.x.push(DescriptorUtils.getDoub(k) / 255.0));
            k.key === "Vrtc" && (contour.y.push(DescriptorUtils.getDoub(k) / 255.0));
            k.key === "Cnty" && (contour.c[contour.c.length-1] = DescriptorUtils.getBool(k));
          }
        }
      }
    }
    //Presets.contours[contour.name] = contour;
    return contour;
  }

  static getGradient(item:IDescriptorItem):IGradientDef {
    let gradient:IGradientDef = {name: "Custom", alphaStops: [], colorStops: []};
    let desc = (item.data as Objc).value;
    for (let i of (desc.item as IDescriptorItem[])) {
      i.key === "Nm  " && (gradient.name = DescriptorUtils.getText(i));
      //i.key === "GrdF" && (gradient.form) = getEnum(i)); --> always CstS
      //i.key === "Intr" && (gradient.interpolation) = getDoub(i)); --> 4096
      if (i.key == "Clrs") {
        for (let j of (i.data as VlLs).item) {
          let colorStop:ColorStop = {location: 0, midpoint: 0, type: "userStop", color: {r: 0, g: 0, b: 0}};
          for (let k of (j.data as Objc).value.item) {
            k.key === "Clr " && (colorStop.color = DescriptorUtils.getColor(k));
            k.key === "Type" && (colorStop.type = DescriptorUtils.getEnum(k) as ColorStopType);
            k.key === "Lctn" && (colorStop.location = DescriptorUtils.getLong(k) / 4096.0);
            k.key === "Mdpn" && (colorStop.midpoint = DescriptorUtils.getLong(k) / 100.0);
          }
          gradient.colorStops.push(colorStop);
        }
      }
      if (i.key == "Trns") {
        for (let j of (i.data as VlLs).item) {
          let alphaStop:AlphaStop = {location: 0, midpoint: 0, alpha: 0};
          for (let k of (j.data as Objc).value.item) {
            k.key === "Opct" && (alphaStop.alpha = DescriptorUtils.getUntf(k));
            k.key === "Lctn" && (alphaStop.location = DescriptorUtils.getLong(k) / 4096.0);
            k.key === "Mdpn" && (alphaStop.midpoint = DescriptorUtils.getLong(k) / 100.0);
          }
          gradient.alphaStops.push(alphaStop);
        }
      }
    }
    //Presets.gradients[gradient.name] = gradient;
    return gradient;
  }

  static getPattern(item:IDescriptorItem):IPatternRef {
    let pattern:IPatternRef = {name: "Custom", uuid: ""};
    var desc = (item.data as Objc).value;
    for (let i of (desc.item as IDescriptorItem[])) {
      i.key == "Nm  " && (pattern.name = DescriptorUtils.getText(i));
      i.key == "Idnt" && (pattern.uuid = DescriptorUtils.getText(i).substring(0, 36));
    }
    return pattern;
  }

  static getUnitRect(item:IDescriptorItem):{ unitValueQuadVersion : number, Top : number, Left : number, Btom : number, Rght : number } {
    let rect:{ unitValueQuadVersion : number, Top : number, Left : number, Btom : number, Rght : number } = {
      Top : 0, Left : 0, Btom : 0, Rght : 0, unitValueQuadVersion : 0
    }
    var desc = (item.data as Objc).value;
    for (let i of (desc.item as IDescriptorItem[])) {
      if(i.key == "unitValueQuadVersion") rect.unitValueQuadVersion = DescriptorUtils.getLong(i);
      if(i.key == "Top") rect.Top = DescriptorUtils.getUntf(i);
      if(i.key == "Left") rect.Left = DescriptorUtils.getUntf(i);
      if(i.key == "Btom") rect.Btom = DescriptorUtils.getUntf(i);
      if(i.key == "Rght") rect.Rght = DescriptorUtils.getUntf(i);
    }
    return rect;
  }

  static getLfx2(descriptor:Descriptor) {
    let cfg:ILayerEffectConfig = _.merge( {}, LayerEffectConfigDefault);
    descriptor.item.forEach((di:IDescriptorItem)=> {
      (di.key === "masterFXSwitch") && (cfg.masterFXSwitch = DescriptorUtils.getBool(di));
      if (di.key === "DrSh") {
        let dropShadow:EffectShadowOptions = _.merge({}, EffectDefaultDropShadow, { available : true });
        for (let i of ((di.data as Objc).value.item as IDescriptorItem[])) {
          if(i.key === "enab") (dropShadow.enabled = DescriptorUtils.getBool(i));
          if(i.key === "Md  ") (dropShadow.blendMode = DescriptorUtils.getEnum(i) as BlendMode);
          if(i.key === "Clr ") (dropShadow.color = DescriptorUtils.getColor(i));
          if(i.key === "Opct") (dropShadow.opacity = DescriptorUtils.getUntf(i));
          if(i.key === "uglg") (dropShadow.useGlobalLight = DescriptorUtils.getBool(i));
          if(i.key === "lagl") (dropShadow.localAngle = DescriptorUtils.getUntf(i));
          if(i.key === "Dstn") (dropShadow.distance = DescriptorUtils.getUntf(i));
          if(i.key === "Ckmt") (dropShadow.spread = DescriptorUtils.getUntf(i, "#Prc"));
          if(i.key === "blur") (dropShadow.size = DescriptorUtils.getUntf(i));
          if(i.key === "Nose") (dropShadow.contourNoise = DescriptorUtils.getUntf(i));
          if(i.key === "AntA") (dropShadow.contourAntiAlias = DescriptorUtils.getBool(i));
          if(i.key === "TrnS") (dropShadow.contour = DescriptorUtils.getContour(i));
        }
        cfg.dropShadow = dropShadow;
      }
      if (di.key === "IrSh") {
        let innerShadow = _.merge({}, EffectDefaultInnerShadow, { available : true });
        for (let i of ((di.data as Objc).value.item as IDescriptorItem[])) {
          if(i.key === "enab") (innerShadow.enabled = DescriptorUtils.getBool(i));
          if(i.key === "Md  ") (innerShadow.blendMode = DescriptorUtils.getEnum(i) as BlendMode);
          if(i.key === "Clr ") (innerShadow.color = DescriptorUtils.getColor(i));
          if(i.key === "Opct") (innerShadow.opacity = DescriptorUtils.getUntf(i));
          if(i.key === "uglg") (innerShadow.useGlobalLight = DescriptorUtils.getBool(i));
          if(i.key === "lagl") (innerShadow.localAngle = DescriptorUtils.getUntf(i));
          if(i.key === "Dstn") (innerShadow.distance = DescriptorUtils.getUntf(i));
          if(i.key === "Ckmt") (innerShadow.spread = DescriptorUtils.getUntf(i, "#Prc"));
          if(i.key === "blur") (innerShadow.size = DescriptorUtils.getUntf(i));
          if(i.key === "Nose") (innerShadow.contourNoise = DescriptorUtils.getUntf(i));
          if(i.key === "AntA") (innerShadow.contourAntiAlias = DescriptorUtils.getBool(i));
          if(i.key === "TrnS") (innerShadow.contour = DescriptorUtils.getContour(i));
        }
        cfg.innerShadow = innerShadow;
      }
      if (di.key === "OrGl") {
        let outerGlow = _.merge({}, EffectDefaultOuterGlow, { available : true });
        for (let i of ((di.data as Objc).value.item as IDescriptorItem[])) {
          if(i.key === "enab") (outerGlow.enabled = DescriptorUtils.getBool(i));
          if(i.key === "Md  ") (outerGlow.blendMode = DescriptorUtils.getEnum(i) as BlendMode);
          if(i.key === "Clr ") (outerGlow.color = DescriptorUtils.getColor(i), outerGlow.fillType = "color");
          if(i.key === "Opct") (outerGlow.opacity = DescriptorUtils.getUntf(i));
          if(i.key === "GlwT") (outerGlow.technique = DescriptorUtils.getEnum(i) as TechniqueGlow);
          if(i.key === "Ckmt") (outerGlow.spread = DescriptorUtils.getUntf(i, "#Prc"));
          if(i.key === "blur") (outerGlow.size = DescriptorUtils.getUntf(i));
          if(i.key === "Nose") (outerGlow.noise = DescriptorUtils.getUntf(i));
          if(i.key === "ShdN") (outerGlow.contourJitter = DescriptorUtils.getUntf(i));
          if(i.key === "AntA") (outerGlow.contourAntiAlias = DescriptorUtils.getBool(i));
          if(i.key === "TrnS") (outerGlow.contour = DescriptorUtils.getContour(i));
          if(i.key === "Inpr") (outerGlow.contourRange = DescriptorUtils.getUntf(i));
          if(i.key === "Grad") (outerGlow.gradient = DescriptorUtils.getGradient(i), outerGlow.fillType = "gradient");
        }
        cfg.outerGlow = outerGlow;
      }
      if (di.key === "IrGl") {
        let innerGlow = _.merge({}, EffectDefaultInnerGlow, { available : true });
        for (let i of ((di.data as Objc).value.item as IDescriptorItem[])) {
          if(i.key === "enab") (innerGlow.enabled = DescriptorUtils.getBool(i));
          if(i.key === "Md  ") (innerGlow.blendMode = DescriptorUtils.getEnum(i) as BlendMode);
          if(i.key === "Clr ") (innerGlow.color = DescriptorUtils.getColor(i), innerGlow.fillType = "color");
          if(i.key === "Opct") (innerGlow.opacity = DescriptorUtils.getUntf(i));
          if(i.key === "GlwT") (innerGlow.technique = DescriptorUtils.getEnum(i) as TechniqueGlow);
          if(i.key === "Ckmt") (innerGlow.spread = DescriptorUtils.getUntf(i, "#Prc"));
          if(i.key === "blur") (innerGlow.size = DescriptorUtils.getUntf(i));
          if(i.key === "Nose") (innerGlow.noise = DescriptorUtils.getUntf(i));
          if(i.key === "ShdN") (innerGlow.contourJitter = DescriptorUtils.getUntf(i));
          if(i.key === "glwS") (innerGlow.source = DescriptorUtils.getEnum(i) as SourceGlow);
          if(i.key === "AntA") (innerGlow.contourAntiAlias = DescriptorUtils.getBool(i));
          if(i.key === "TrnS") (innerGlow.contour = DescriptorUtils.getContour(i));
          if(i.key === "Inpr") (innerGlow.contourRange = DescriptorUtils.getUntf(i));
          if(i.key === "Grad") (innerGlow.gradient = DescriptorUtils.getGradient(i), innerGlow.fillType = "gradient");
        }
        cfg.innerGlow = innerGlow;
      }
      if (di.key === "ebbl") {
        let bevelEmboss = _.merge({}, EffectDefaultBevelEmboss, { available : true });
        for (let i of ((di.data as Objc).value.item as IDescriptorItem[])) {
          if(i.key === "enab") (bevelEmboss.enabled = DescriptorUtils.getBool(i));
          if(i.key === "hglM") (bevelEmboss.highlightMode = DescriptorUtils.getEnum(i) as BlendMode);
          if(i.key === "hglC") (bevelEmboss.highlightColor = DescriptorUtils.getColor(i));
          if(i.key === "hglO") (bevelEmboss.highlightOpacity = DescriptorUtils.getUntf(i));
          if(i.key === "sdwM") (bevelEmboss.shadowMode = DescriptorUtils.getEnum(i) as BlendMode);
          if(i.key === "sdwC") (bevelEmboss.shadowColor = DescriptorUtils.getColor(i));
          if(i.key === "sdwO") (bevelEmboss.shadowOpacity = DescriptorUtils.getUntf(i));
          if(i.key === "bvlT") (bevelEmboss.technique = DescriptorUtils.getEnum(i) as BevelEmbossTechnique);
          if(i.key === "bvlS") (bevelEmboss.style = DescriptorUtils.getEnum(i) as BevelEmbossStyle);
          if(i.key === "uglg") (bevelEmboss.useGlobalLight = DescriptorUtils.getBool(i));
          if(i.key === "lagl") (bevelEmboss.localAngle = DescriptorUtils.getUntf(i));
          if(i.key === "Lald") (bevelEmboss.localAltitude = DescriptorUtils.getUntf(i));
          if(i.key === "srgR") (bevelEmboss.depth = DescriptorUtils.getUntf(i));
          if(i.key === "blur") (bevelEmboss.size = DescriptorUtils.getUntf(i));
          if(i.key === "bvlD") (bevelEmboss.direction = DescriptorUtils.getEnum(i) as BevelEmbossDirection);
          if(i.key === "TrnS") (bevelEmboss.glossContour = DescriptorUtils.getContour(i));
          if(i.key === "antialiasGloss") (bevelEmboss.glossContourAntiAlias = DescriptorUtils.getBool(i));
          if(i.key === "Sftn") (bevelEmboss.soften = DescriptorUtils.getUntf(i));
          if(i.key === "useShape") (bevelEmboss.contourEnabled = DescriptorUtils.getBool(i));
          if(i.key === "MpgS") (bevelEmboss.contour = DescriptorUtils.getContour(i));
          if(i.key === "AntA") (bevelEmboss.contourAntiAlias = DescriptorUtils.getBool(i));
          if(i.key === "Inpr") (bevelEmboss.contourRange = DescriptorUtils.getUntf(i));
          if(i.key === "useTexture") (bevelEmboss.patternEnabled = DescriptorUtils.getBool(i));
          if(i.key === "InvT") (bevelEmboss.patternInvert = DescriptorUtils.getBool(i));
          if(i.key === "Algn") (bevelEmboss.patternAlign = DescriptorUtils.getBool(i));
          if(i.key === "Scl ") (bevelEmboss.patternScale = DescriptorUtils.getUntf(i));
          if(i.key === "textureDepth") (bevelEmboss.patternDepth = DescriptorUtils.getUntf(i));
          if(i.key === "Ptrn") (bevelEmboss.pattern = DescriptorUtils.getPattern(i));
          if(i.key === "phase") (bevelEmboss.patternPhase = DescriptorUtils.getPhase(i));
        }
        cfg.bevelEmboss = bevelEmboss;
      }
      if (di.key === "ChFX") {
        let satin = _.merge({}, EffectDefaultSatin, { available : true });
        for (let i of ((di.data as Objc).value.item as IDescriptorItem[])) {
          if(i.key === "enab") (satin.enabled = DescriptorUtils.getBool(i));
          if(i.key === "Md  ") (satin.blendMode = DescriptorUtils.getEnum(i) as BlendMode);
          if(i.key === "Clr ") (satin.color = DescriptorUtils.getColor(i));
          if(i.key === "Invr") (satin.invert = DescriptorUtils.getBool(i));
          if(i.key === "Opct") (satin.opacity = DescriptorUtils.getUntf(i));
          if(i.key === "lagl") (satin.angle = DescriptorUtils.getUntf(i));
          if(i.key === "Dstn") (satin.distance = DescriptorUtils.getUntf(i));
          if(i.key === "blur") (satin.size = DescriptorUtils.getUntf(i));
          if(i.key === "MpgS") (satin.contour = DescriptorUtils.getContour(i));
          if(i.key === "AntA") (satin.contourAntiAlias = DescriptorUtils.getBool(i));
        }
        cfg.satin = satin;
      }
      if (di.key === "SoFi") {
        let colorOverlay = _.merge({}, EffectDefaultColorOverlay, { available : true });
        for (let i of ((di.data as Objc).value.item as IDescriptorItem[])) {
          if(i.key === "enab") (colorOverlay.enabled = DescriptorUtils.getBool(i));
          if(i.key === "Md  ") (colorOverlay.blendMode = DescriptorUtils.getEnum(i) as BlendMode);
          if(i.key === "Opct") (colorOverlay.opacity = DescriptorUtils.getUntf(i));
          if(i.key === "Clr ") (colorOverlay.color = DescriptorUtils.getColor(i));
        }
        cfg.colorOverlay = colorOverlay;
      }
      if (di.key === "GrFl") {
        let gradientOverlay = _.merge({}, EffectDefaultGradientOverlay, { available : true });
        for (let i of ((di.data as Objc).value.item as IDescriptorItem[])) {
          if(i.key === "enab") (gradientOverlay.enabled = DescriptorUtils.getBool(i));
          if(i.key === "Md  ") (gradientOverlay.blendMode = DescriptorUtils.getEnum(i) as BlendMode);
          if(i.key === "Opct") (gradientOverlay.opacity = DescriptorUtils.getUntf(i));
          if(i.key === "Grad") (gradientOverlay.gradient = DescriptorUtils.getGradient(i));
          if(i.key === "Angl") (gradientOverlay.angle = DescriptorUtils.getUntf(i));
          if(i.key === "Type") (gradientOverlay.gradientType = DescriptorUtils.getEnum(i) as GradientStyle);
          if(i.key === "Rvrs") (gradientOverlay.reverse = DescriptorUtils.getBool(i));
          if(i.key === "Algn") (gradientOverlay.alignWithLayer = DescriptorUtils.getBool(i));
          if(i.key === "Ofst") (gradientOverlay.offset = DescriptorUtils.getPoint(i));
          if(i.key === "Scl " ) (gradientOverlay.scale = DescriptorUtils.getUntf(i));
        }
        cfg.gradientOverlay = gradientOverlay;
      }
      if (di.key === "patternFill") {
        let patternOverlay = _.merge({}, EffectDefaultPatternOverlay, { available : true });
        for (let i of ((di.data as Objc).value.item as IDescriptorItem[])) {
          if(i.key === "enab" ) (patternOverlay.enabled = DescriptorUtils.getBool(i));
          if(i.key === "Md  " ) (patternOverlay.blendMode = DescriptorUtils.getEnum(i) as BlendMode);
          if(i.key === "Opct" ) (patternOverlay.opacity = DescriptorUtils.getUntf(i));
          if(i.key === "Ptrn" ) (patternOverlay.pattern = DescriptorUtils.getPattern(i));
          if(i.key === "Scl " ) (patternOverlay.patternScale = DescriptorUtils.getUntf(i));
          if(i.key === "Algn" ) (patternOverlay.alignToLayer = DescriptorUtils.getBool(i));
          if(i.key === "phase") (patternOverlay.patternPhase = DescriptorUtils.getPhase(i));
        }
        cfg.patternOverlay = patternOverlay;
      }
      if (di.key === "FrFX") {
        let stroke = _.merge({}, EffectDefaultStroke, { available : true });
        for (let i of ((di.data as Objc).value.item as IDescriptorItem[])) {
          if(i.key === "enab" ) (stroke.enabled = DescriptorUtils.getBool(i));
          if(i.key === "Md  " ) (stroke.blendMode = DescriptorUtils.getEnum(i) as BlendMode);
          if(i.key === "Opct" ) (stroke.opacity = DescriptorUtils.getUntf(i));
          if(i.key === "Styl" ) (stroke.position = DescriptorUtils.getEnum(i) as StrokePosition);
          if(i.key === "PntT" ) (stroke.fillType = DescriptorUtils.getEnum(i) as FillType);
          if(i.key === "Sz  " ) (stroke.size = DescriptorUtils.getUntf(i));
          if(i.key === "Clr " ) (stroke.color = DescriptorUtils.getColor(i), stroke.fillType = "color");
          if(i.key === "Grad" ) (stroke.gradient = DescriptorUtils.getGradient(i), stroke.fillType = "gradient");
          if(i.key === "Angl" ) (stroke.gradientAngle = DescriptorUtils.getUntf(i));
          if(i.key === "Type" ) (stroke.gradientType = DescriptorUtils.getEnum(i) as GradientStyle);
          if(i.key === "Scl " ) (stroke.gradientScale = DescriptorUtils.getUntf(i));
          if(i.key === "Rvrs" ) (stroke.gradientReverse = DescriptorUtils.getBool(i));
          if(i.key === "Algn" ) (stroke.gradientAlignWithLayer = DescriptorUtils.getBool(i));
          if(i.key === "Ofst" ) (stroke.gradientOffset = DescriptorUtils.getPoint(i));
          if(i.key === "Dthr" ) (stroke.gradientDither = DescriptorUtils.getBool(i));
          if(i.key === "Ptrn" ) (stroke.pattern = DescriptorUtils.getPattern(i), stroke.fillType = "pattern");
          if(i.key === "Scl " ) (stroke.patternScale = DescriptorUtils.getUntf(i));
          if(i.key === "Lnkd" ) (stroke.patternLinkedWithLayer = DescriptorUtils.getBool(i));
          if(i.key === "phase")  (stroke.patternPhase = DescriptorUtils.getPhase(i));
        }
        cfg.stroke = stroke;
      }
    });
    return cfg;
  }

  static getWarpData(descriptor:Descriptor):IWarpSettings {
    let settings:IWarpSettings = _.merge( {}, WarpSettingsDefault);
    descriptor.item.forEach((di:IDescriptorItem)=> {
      if(di.key === "warpStyle") settings.style = DescriptorUtils.getEnum(di) as WarpStyle;
      else if(di.key === "warpValue") settings.bend = DescriptorUtils.getDoub(di);
      else if(di.key === "warpPerspective") settings.hDist = DescriptorUtils.getDoub(di);
      else if(di.key === "warpPerspectiveOther") settings.vDist = DescriptorUtils.getDoub(di);
      else if(di.key === "warpRotate") settings.orientation = DescriptorUtils.getEnum(di) as WarpOrientation;
      else if(di.key === "bounds") settings.bounds = DescriptorUtils.getRctn(di);
      else if(di.key === "customEnvelopeWarp") settings.customEnvelopeWarp = DescriptorUtils.getCustomEnvelopeWarp(di);
      else if(di.key === "uOrder") settings.uOrder = DescriptorUtils.getLong(di);
      else if(di.key === "vOrder") settings.vOrder = DescriptorUtils.getLong(di);
    });
    return settings;
  }

  static getCustomEnvelopeWarp(item:IDescriptorItem):{ x : number, y : number }[] {
    let customEnvelopeWarp:{ x : number, y : number }[] = [];
    let desc = (item.data as Objc).value;
    desc.item.forEach(di => {
      if(di.key === "meshPoints") {
        const obAr = (di.data as ObAr);
        const pointCount = (obAr.item[0].data as UnFl).value.length;
        for(let i = 0; i < pointCount; i++) {
          const x = (obAr.item[0].data as UnFl).value[i];
          const y = (obAr.item[1].data as UnFl).value[i];
          customEnvelopeWarp.push({ x, y });
        }
      }
    });

    return customEnvelopeWarp;
  }

  //TODO: extract from PSDLoader.

  // static getBlendConfig(item:AdditionalLayerInfo[]) {
  //   let cfg:ILayerBlendConfig = _.merge({}, LayerBlendConfigDefault);
  //
  //   for(let i of item) {
  //     i.key === "iOpa" && (cfg.fillOpacity = (i.info as iOpa).opacity/255.0);
  //     i.key === "infx" && (cfg.blendInteriorAsGroup = (i.info as infx).blendInteriorElements);
  //     i.key === "clbl" && (cfg.blendClippedAsGroup = (i.info as clbl).blendClippedElements);
  //     if(i.key === "knko") {
  //       switch((i.info as knko).knockout) {
  //         case 0 : cfg.knockout = "none"; break;
  //         case 1 : cfg.knockout = "shallow"; break;
  //         case 2 : cfg.knockout = "deep"; break;
  //       }
  //     }
  //     i.key === "tsly" && (cfg.transparencyShapesLayer = (i.info as tsly).transparencyShapesLayer);
  //     i.key === "lmgm" && (cfg.layerMaskAsGlobalMask = (i.info as lmgm).layerMaskHidesEffects);
  //     i.key === "vmgm" && (cfg.vectorMaskAsGlobalMask = (i.info as vmgm).vectorMaskHidesEffects);
  //     i.key === "brst" && (cfg.channelRestrictions = (i.info as brst).channels);
  //     i.key === "fxrp" && (cfg.referencePoint = (i.info as fxrp).referencePoint);
  //     i.key === "lsct" && (cfg.blendMode = DescriptorUtils.convertEnumTypeToPs("BlendModeKey",(i.info as lsct).key) as BlendMode)
  //   }
  //   return cfg;
  // }

  // static getBlendOptions

  static getPaths(records:PathRecord[], width:number, height:number):{ initialFill : number, paths : PCompoundPath[]}|undefined {
    const paths: PCompoundPath[] = [];
    let initialFill = 0;
    let currentCompoundPath: PCompoundPath | undefined;
    let currentPath: PPath | undefined;
    let length: number = 0;
    records.forEach((record, i: number) => {
      switch (record.type) {
        case PathRecordType.INITIAL_FILL_RULE: {
          initialFill = record.initialFillRule;
        } break;
        case PathRecordType.OPEN_SUBPATH_LENGTH:
        case PathRecordType.CLOSED_SUBPATH_LENGTH: {
          if (record.subPathCombinationType != PathRecordSubpathCombinationType.sameComponent) {
            currentCompoundPath = new PCompoundPath();
            switch(record.subPathCombinationType) {
              case PathRecordSubpathCombinationType.union:currentCompoundPath.setBooleanOp("union"); break;
              case PathRecordSubpathCombinationType.difference:currentCompoundPath.setBooleanOp("exclude"); break;
              case PathRecordSubpathCombinationType.subtract:currentCompoundPath.setBooleanOp("subtract"); break;
              case PathRecordSubpathCombinationType.intersection:currentCompoundPath.setBooleanOp("intersect"); break;
            }
            paths.push(currentCompoundPath);
          }
          currentPath = new PPath();
          currentPath.setClosed(record.type === PathRecordType.CLOSED_SUBPATH_LENGTH);
          if (!currentCompoundPath) throw new Error("currentCompoundPath is undefined");
          currentCompoundPath.addChild(currentPath);
          length = record.subPathLength;
        }
          break;
        case PathRecordType.CLOSED_SUBPATH_BEZIER_KNOT_LINKED:
        case PathRecordType.CLOSED_SUBPATH_BEZIER_KNOT_UNLINKED:
        case PathRecordType.OPEN_SUBPATH_BEZIER_KNOT_LINKED:
        case PathRecordType.OPEN_SUBPATH_BEZIER_KNOT_UNLINKED: {
          const seg = PPathSegment.fromCoords(record.anchorX * width, record.anchorY * height,
            (record.control1X - record.anchorX) * width, (record.control1Y - record.anchorY) * height,
            (record.control2X - record.anchorX) * width, (record.control2Y - record.anchorY) * height);
          seg.setLinked(record.type === PathRecordType.CLOSED_SUBPATH_BEZIER_KNOT_LINKED ||
            record.type === PathRecordType.OPEN_SUBPATH_BEZIER_KNOT_LINKED);
          if (!currentPath) throw new Error("currentPath is undefined");
          currentPath.addSegment(seg);
        }
          break;
        default:
          break;
      }
    });

    return { initialFill, paths };
  }

  static setBool(value:boolean):bool {
    let _bool = new bool();
    _bool.value = value;
    return _bool;
  }

  static setDoub(value:number):doub {
    let _doub = new doub();
    _doub.value = value;
    return _doub;
  }

  static setLong(value:number):long {
    let _long = new long();
    _long.value = Math.trunc(value);
    return _long;
  }

  static setText(value:string):TEXT {
    let _TEXT = new TEXT();
    _TEXT.string = value;
    return _TEXT;
  }

  static setVlLs(value : IDescriptorInfoBlock[], type : DescriptorItemType) {
    let _vlLs = new VlLs();
    _vlLs.item = [];
    value.forEach(value2 => {
      _vlLs.item.push({ type, data : value2 });
    })
    return _vlLs;
  }

  static setEnum(type:string, value:string):_enum {
    let __enum = new _enum();
    __enum._type = type;

    if (DescriptorUtils.enumMap[type] && DescriptorUtils.enumMap[type].cp.indexOf(value) >= 0) {
      __enum._enum = DescriptorUtils.enumMap[type].ps[DescriptorUtils.enumMap[type].cp.indexOf(value)];
      return __enum;
    }

    throw new Error("Unknown enum value/type: " + value + "/" + type);
  }

  static setUntf(value:number, units:"#Prc"|"#Pxl"|"#Ang"|"#Pnt"|"#Nne"):UntF {
    let _UntF = new UntF();
    _UntF.units = units;
    switch(units) {
      case "#Prc": _UntF.value = value*100; break;
      case "#Pxl": _UntF.value = value; break;
      case "#Ang": _UntF.value = rad2deg(value); break;
      case "#Pnt": _UntF.value = value; break; //TODO: include conversion
      case "#Nne": _UntF.value = value; break;
    }
    return _UntF;
  }

  static setColor(value:Color):Objc {
    let color = new Objc();
    color.value = new Descriptor();
    color.value.classId = "RGBC";
    color.value.name = "\u0000";
    color.value.items = 3;
    color.value.item = [
      {
        key : "Rd  ",
        type : "doub",
        data : DescriptorUtils.setDoub(value.r)
      },
      {
        key : "Grn ",
        type : "doub",
        data : DescriptorUtils.setDoub(value.g)
      },
      {
        key : "Bl  ",
        type : "doub",
        data : DescriptorUtils.setDoub(value.b)
      }
    ];
    return color
  }

  static setPhase(value : { x:number, y:number}) {
    let phase = new Objc();
    phase.value = new Descriptor();
    phase.value.classId = "Pnt ";
    phase.value.name = "\u0000";
    phase.value.items = 2;
    phase.value.item = [
      { key : "Hrzn", type : "doub", data : DescriptorUtils.setDoub(value.x)},
      { key : "Vrtc", type : "doub", data : DescriptorUtils.setDoub(value.y)}
    ];
    return phase;
  }

  static setPoint(value:{ x:number, y:number}) {
    let point = new Objc();
    point.value = new Descriptor();
    point.value.classId = "Pnt "; //TODO
    point.value.name = "\u0000";
    point.value.items = 2;
    point.value.item = [
      {
        key : "Hrzn",
        type : "UntF",
        data : DescriptorUtils.setUntf(value.x, "#Prc")
      },
      {
        key : "Vrtc",
        type : "UntF",
        data : DescriptorUtils.setUntf(value.y, "#Prc")
      }
    ];
    return point;
  }

  static setContour(value:IContourDef) {
    let contour = new Objc();
    contour.value = new Descriptor();
    contour.value.classId = "ShpC";
    contour.value.name = "\u0000";
    contour.value.item = [];
    let itemName:IDescriptorItem = {
      key  : "Nm  ",
      type : "TEXT",
      data : DescriptorUtils.setText(value.name)
    };
    let curve:Objc[] = [];
    value.x.forEach((value2, index) => {
      let point = new Objc();
      point.value = new Descriptor();
      point.value.classId = "CrPt";
      point.value.name = "\u0000";
      point.value.items = 3;
      point.value.item = [
        { key : "Hrzn", type : "doub", data : DescriptorUtils.setDoub(value.x[index] * 255.0)},
        { key : "Vrtc", type : "doub", data : DescriptorUtils.setDoub(value.y[index] * 255.0)},
        { key : "Cnty", type : "bool", data : DescriptorUtils.setBool(value.c[index])}
      ];
      curve.push(point);
    });
    let itemCrv:IDescriptorItem = {
      key : "Crv ",
      type : "VlLs",
      data : DescriptorUtils.setVlLs(curve, "Objc")
    };
    contour.value.item.push(itemName);
    contour.value.item.push(itemCrv);
    contour.value.items = contour.value.item.length;
    return contour;
  }

  static setGradient(value:IGradientDef):Objc {
    let gradient = new Objc();
    gradient.value = new Descriptor();
    gradient.value.classId = "Gradient\u0000";
    gradient.value.name = value.name;
    gradient.value.item = [];
    let itemName:IDescriptorItem = {
      key  : "Nm  ",
      type : "TEXT",
      data : DescriptorUtils.setText(value.name)
    };
    //GrdF enum!
    let itemIntr:IDescriptorItem = {
      key : "Intr",
      type : "doub",
      data : DescriptorUtils.setDoub(4096)
    };
    let colorStops:Objc[] = [];
    value.colorStops.forEach(value2 => {
      let stop = new Objc();
      stop.value = new Descriptor();
      stop.value.classId = "Clrt";
      stop.value.name = "\u0000";
      stop.value.items = 4;
      stop.value.item = [
        { key : "Clr ", type : "Objc", data : DescriptorUtils.setColor(value2.color) },
        { key : "Type", type : "enum", data : DescriptorUtils.setEnum("Clry", value2.type) },
        { key : "Lctn", type : "long", data : DescriptorUtils.setLong(value2.location * 4096) },
        { key : "Mdpn", type : "long", data : DescriptorUtils.setLong(typeof value2.midpoint === "number" ? value2.midpoint * 100 : 50) }
      ];
      colorStops.push(stop);
    });
    let itemClrs:IDescriptorItem = {
      key : "Clrs",
      type : "VlLs",
      data : DescriptorUtils.setVlLs(colorStops, "Objc")
    };

    let alphaStops:Objc[] = [];
    value.alphaStops.forEach(value2 => {
      let stop = new Objc();
      stop.value = new Descriptor();
      stop.value.classId = "TrnS";
      stop.value.name = "\u0000";
      stop.value.items = 3;
      stop.value.item = [
        { key : "Opct", type : "UntF", data : DescriptorUtils.setUntf(value2.alpha, "#Prc")},
        { key : "Lctn", type : "long", data : DescriptorUtils.setLong(value2.location * 4096) },
        { key : "Mdpn", type : "long", data : DescriptorUtils.setLong(typeof value2.midpoint === "number" ? value2.midpoint * 100 : 50) }
      ]
      alphaStops.push(stop);
    });
    let itemTrnS:IDescriptorItem = {
      key : "Trns",
      type : "VlLs",
      data : DescriptorUtils.setVlLs(alphaStops, "Objc")
    };
    gradient.value.item.push(itemName);
    gradient.value.item.push(itemIntr);
    gradient.value.item.push(itemClrs);
    gradient.value.item.push(itemTrnS);
    gradient.value.items = gradient.value.item.length;
    return gradient;
  }

  static setPattern(value:IPatternRef):Objc {
    let pattern = new Objc();
    pattern.value = new Descriptor();
    pattern.value.name = "\u0000";
    pattern.value.classId = "Ptrn";
    pattern.value.item = [];
    let itemName:IDescriptorItem = {
      key  : "Nm  ",
      type : "TEXT",
      data : DescriptorUtils.setText(value.name+"\u0000")
    };
    pattern.value.item.push(itemName);

    if(value.uuid) {
      let itemIdnt:IDescriptorItem = {
        key : "Idnt",
        type : "TEXT",
        data : DescriptorUtils.setText(value.uuid+"\u0000") //substring???
      };
      pattern.value.item.push(itemIdnt);
    }
    pattern.value.items = pattern.value.item.length;
    return pattern;
  }

  static setPaths(paths : { initialFill : number, paths : PCompoundPath[]}, width : number, height : number):PathRecord[] {
    const records:PathRecord[] = [];

    let r:PathRecord = new PathRecord();
    r.type = PathRecordType.PATH_FILL_RULE;
    records.push(r);

    r = new PathRecord();
    r.type = PathRecordType.INITIAL_FILL_RULE;
    r.initialFillRule = paths.initialFill;
    records.push(r);

    paths.paths.forEach(pc => {
      pc.children.forEach((ppath, index) => {
        r = new PathRecord();
        r.type = ppath.isClosed() ? PathRecordType.CLOSED_SUBPATH_LENGTH : PathRecordType.OPEN_SUBPATH_LENGTH;
        r.subPathLength = ppath.segments.length;
        if(index === 0) {
          r.subPathCombinationType = PathBooleanOpArray.indexOf(pc.getBooleanOp());
        } else {
          r.subPathCombinationType = PathRecordSubpathCombinationType.sameComponent;
        }
        records.push(r);

        ppath.segments.forEach(segment => {
          r = new PathRecord();
          if(ppath.isClosed()) {
            r.type = segment.isLinked() ? PathRecordType.CLOSED_SUBPATH_BEZIER_KNOT_LINKED :
              PathRecordType.CLOSED_SUBPATH_BEZIER_KNOT_UNLINKED;
          } else {
            r.type = segment.isLinked() ? PathRecordType.OPEN_SUBPATH_BEZIER_KNOT_LINKED :
              PathRecordType.OPEN_SUBPATH_BEZIER_KNOT_UNLINKED
          }
          r.anchorX = segment.getPoint().x / width;
          r.anchorY = segment.getPoint().y / height;
          r.control1X = (segment.getHandleIn().x + segment.getPoint().x) / width;
          r.control1Y = (segment.getHandleIn().y + segment.getPoint().y) / height;
          r.control2X = (segment.getHandleOut().x + segment.getPoint().x) / width;
          r.control2Y = (segment.getHandleOut().y + segment.getPoint().y) / height;
          records.push(r);
        });
      })
    });

    return records;
  }

  static setWarpData(value:IWarpSettings):Descriptor {
    const warpData = new Descriptor();
    warpData.name = "\u0000";
    warpData.classId = "warp";
    warpData.items = 5;
    warpData.item = [];
    warpData.item.push({key:"warpStyle",type:"enum",data:DescriptorUtils.setEnum("warpStyle", value.style)});
    warpData.item.push({key:"warpValue",type:"doub",data:DescriptorUtils.setDoub(value.bend)});
    warpData.item.push({key:"warpPerspective",type:"doub",data:DescriptorUtils.setDoub(value.hDist)});
    warpData.item.push({key:"warpPerspectiveOther",type:"doub",data:DescriptorUtils.setDoub(value.vDist)});
    warpData.item.push({key:"warpRotate",type:"enum",data:DescriptorUtils.setEnum("Ornt", value.orientation)});
    return warpData;
  }
}