import * as _ from 'lodash';
import {deg2rad, linspace} from "../Utils/Utils";
import {
  BlendRange,
  EffectBevelEmbossOptions,
  EffectColorOverlayOptions,
  EffectGlowOptions,
  EffectGradientOverlayOptions,
  EffectPatternOverlayOptions,
  EffectSatinOptions,
  EffectShadowOptions,
  EffectStrokeOptions,
  IBrushDef,
  IBrushTip,
  ICanvasSizeSettings,
  IColorDynamics,
  IContourDef,
  ICurveDef,
  IDocumentLimits,
  IDocumentSettings,
  IDualBrush,
  IFillContent,
  IFillSettings,
  IFillStyleSettings,
  IGradientDef,
  IHistogram,
  IImageSizeSettings,
  ILayerBlendConfig,
  ILayerEffectConfig,
  ILayerNewSettings,
  IMapDef,
  IOtherDynamics,
  IPatternRef,
  IScattering,
  IShapeDef,
  IStrokeSettings,
  IStrokeStyleSettings,
  ITextureBrush,
  ITipDynamics,
  IWarpSettings
} from "./GLTypes";
import {LayerKind} from "../Layer/EnumLayerType";
import {IGradientSettings, IPatternSettings, ISolidColorSettings} from "../Adjustments/GLAdjustmentTypes";
import {PCompoundPath} from "../PPath/PCompoundPath";
import {InsertPosition} from "../Layer/EnumReorderPosition";

export const GradientDefDefault : IGradientDef = {
  name:"black,white",
  colorStops: [
    {type:"userStop",location: 0.0, midpoint: 0.5, color : { r: 0, g: 0, b: 0}},
    {type:"userStop",location: 1.0, color : { r: 255, g: 255, b: 255}}
  ],
  alphaStops: [
    {location: 0.0, midpoint: 0.5, alpha: 1.0},
    {location: 1.0, alpha: 1.0}
  ]
};

export const ContourDefDefault: IContourDef = {
  name: "Linear", x: [0.0, 1.0], y: [0.0, 1.0], c: [false, false]
};

export const CurveDefDefault: ICurveDef = {
  x: [0.0, 1.0], y: [0.0, 1.0], c: [false, false]
};

export const MapDefDefault : IMapDef = {
  x : linspace(0,255,256),
  y : linspace( 0, 255, 256)
};

export const PatternRefDefault : IPatternRef = {
  name : "embossedholes",
  uuid : "c9fcae9a-b021-11df-985b-95b33403acff"
};

export const BlendRangesDefault:BlendRange[] = [
  {
    channel : "Gray",
    srcMinBlack : 0,
    srcMaxBlack : 0,
    srcMinWhite : 255,
    srcMaxWhite : 255,
    dstMinBlack : 0,
    dstMaxBlack : 0,
    dstMinWhite : 255,
    dstMaxWhite : 255,
  },
  {
    channel : "Red",
    srcMinBlack : 0,
    srcMaxBlack : 0,
    srcMinWhite : 255,
    srcMaxWhite : 255,
    dstMinBlack : 0,
    dstMaxBlack : 0,
    dstMinWhite : 255,
    dstMaxWhite : 255,
  },
  {
    channel : "Green",
    srcMinBlack : 0,
    srcMaxBlack : 0,
    srcMinWhite : 255,
    srcMaxWhite : 255,
    dstMinBlack : 0,
    dstMaxBlack : 0,
    dstMinWhite : 255,
    dstMaxWhite : 255,
  },
  {
    channel : "Blue",
    srcMinBlack : 0,
    srcMaxBlack : 0,
    srcMinWhite : 255,
    srcMaxWhite : 255,
    dstMinBlack : 0,
    dstMaxBlack : 0,
    dstMinWhite : 255,
    dstMaxWhite : 255,
  }
];

export const LayerBlendConfigDefault:ILayerBlendConfig = {
  opacity : 1.0,
  blendMode : "normal",
  fillOpacity : 1.0,
  blendClippedAsGroup : true,
  blendInteriorAsGroup : false,
  knockout : "none",
  transparencyShapesLayer : true,
  layerMaskAsGlobalMask : false,
  vectorMaskAsGlobalMask : false,
  referencePoint : { x : 0, y : 0},
  blendRanges : _.cloneDeep(BlendRangesDefault),
  channelRestrictions : []
};


export const EffectDefaultDropShadow : EffectShadowOptions = {
  enabled: false,
  available : false,
  blendMode: "multiply",
  color: {r: 0, g: 0, b: 0},
  localAngle: deg2rad(120),
  useGlobalLight : false,
  opacity: 0.75,
  spread: 0,
  size: 5,
  distance: 5,
  contour : _.clone(ContourDefDefault),
  contourAntiAlias: false,
  contourNoise: 0,
};

export const EffectDefaultInnerShadow : EffectShadowOptions = {
  enabled: false,
  available : false,
  blendMode: "multiply",
  color: {r: 0, g: 0, b: 0},
  localAngle: deg2rad(120),
  useGlobalLight : false,
  opacity: 0.75,
  spread: 0,
  size: 5,
  distance: 5,
  contour : _.clone(ContourDefDefault),
  contourAntiAlias: false,
  contourNoise: 0,
};

export const EffectDefaultOuterGlow : EffectGlowOptions = {
  enabled: false,
  available : false,
  blendMode: "screen",
  opacity: 0.75,
  noise:0.0,
  fillType:"color",
  color: {r: 255, g: 255, b: 255},
  gradient : _.clone(GradientDefDefault),
  spread: 0,
  size: 5,
  technique: "precise",
  contour: _.clone(ContourDefDefault),
  contourRange: 0.5,
  contourAntiAlias : false,
  contourJitter: 0
};

export const EffectDefaultInnerGlow : EffectGlowOptions = {
  enabled: false,
  available : false,
  blendMode: "screen",
  opacity: 0.75,
  noise:0.0,
  fillType:"color",
  color: {r: 255, g: 255, b: 190},
  gradient : _.clone(GradientDefDefault),
  spread: 0,
  size: 5,
  technique: "precise",
  contour : _.clone(ContourDefDefault),
  contourRange: 0.5,
  contourAntiAlias : false,
  contourJitter: 0
};

export const EffectDefaultBevelEmboss : EffectBevelEmbossOptions = {
  enabled: false,
  available : false,
  innerOuter : "inner",
  style: "outerBevel",
  technique: "smooth",
  depth: 1.0,
  direction: "up",
  size: 30,
  soften: 0,
  localAngle: deg2rad(120),
  localAltitude: deg2rad(30),
  useGlobalLight : false,
  glossContour: _.clone(ContourDefDefault),
  glossContourAntiAlias : false,
  highlightMode: "screen",
  highlightColor: {r: 255, g: 255, b: 255},
  highlightOpacity: 0.75,
  shadowMode: "multiply",
  shadowColor: {r: 0, g: 0, b: 0},
  shadowOpacity: 0.75,
  lightingMode: "shadows",

  //contour
  contourEnabled:false,
  contour : _.clone(ContourDefDefault),
  contourAntiAlias : false,
  contourRange:0.5,

  //texture
  patternEnabled: false,
  pattern: _.clone(PatternRefDefault),
  patternScale: 1.0,
  patternDepth: 1.0,
  patternInvert: false,
  patternAlign: false,
  patternPhase : { x : 0, y : 0 }
};

export const EffectDefaultSatin : EffectSatinOptions = {
  enabled: false,
  available : false,
  blendMode: "multiply",
  color: {r: 0, g: 0, b: 0},
  opacity: 0.5,
  angle: deg2rad(19.0),
  distance: 11.0,
  size: 14.0,
  contour : _.clone(ContourDefDefault),
  contourAntiAlias:false,
  invert: true
};
export const EffectDefaultColorOverlay : EffectColorOverlayOptions = {
  enabled: false,
  available : false,
  blendMode: "normal",
  color: {r: 255, g: 0, b: 0},
  opacity: 1.0
};

export const EffectDefaultGradientOverlay : EffectGradientOverlayOptions = {
  enabled: false,
  available : false,
  blendMode: "normal",
  opacity: 1.0,
  gradient : _.clone(GradientDefDefault),
  gradientType: "linear",
  reverse: false,
  alignWithLayer: true,
  angle: deg2rad(90),
  scale: 1.0,
  offset : { x : 0, y : 0 }
};

export const EffectDefaultPatternOverlay : EffectPatternOverlayOptions = {
  enabled: false,
  available : false,
  blendMode: "normal",
  opacity: 1.0,
  pattern: _.clone(PatternRefDefault),
  patternScale: 1.0,
  patternPhase : { x : 0, y : 0 },
  alignToLayer: true
};

export const EffectDefaultStroke : EffectStrokeOptions = {
    enabled: false,
    available : false,
    innerOuter : "inner",
    blendMode: "normal",
    opacity: 1.0,
    size: 3,
    position: "outside",
    fillType: "color",
    color: {r: 255, g: 0, b: 0},
    gradient : _.clone(GradientDefDefault),
    gradientReverse:false,
    gradientType : "linear",
    gradientAngle : 0.52,
    gradientScale : 0.5,
    gradientAlignWithLayer : false,
    gradientOffset : { x : 0, y : 0},
    gradientDither : false,
    pattern : _.clone(PatternRefDefault),
    patternScale : 1.0,
    patternLinkedWithLayer : false,
    patternPhase : { x : 0, y : 0 }
  }
;

export const LayerEffectConfigDefault:ILayerEffectConfig = {
  masterFXSwitch: true,
  dropShadow: EffectDefaultDropShadow,
  innerShadow: EffectDefaultInnerShadow,
  outerGlow: EffectDefaultOuterGlow,
  innerGlow: EffectDefaultInnerGlow,
  bevelEmboss: EffectDefaultBevelEmboss,
  satin: EffectDefaultSatin,
  colorOverlay: EffectDefaultColorOverlay,
  gradientOverlay: EffectDefaultGradientOverlay,
  patternOverlay: EffectDefaultPatternOverlay,
  stroke: EffectDefaultStroke
};

//////////////////////////////////////////////////////////////

export const BrushDefDefaultTip:IBrushTip = {
  type : "computed",
  diameter : 9, //[px]
  hardness : 1.0, //[%]
  angle : 0, // [#Ang]
  roundness : 1.0, //[%]
  spacing : 0.25, //[%]
  spacingEnabled : true,
  flipX : false,
  flipY : false,
  sampledData : null //uuid
};
export const BrushDefDefaultTipDynamics:ITipDynamics = {
  enabled : true,
  minimumDiameter : 0, //[%]
  minimumRoundness : 0.25, //[%]
  tiltScale : 0.0, //[%]
  sizeDynamics : { controller : "Off", fadeStep : 0, jitter : 0.0 },
  angleDynamics : { controller : "Off", fadeStep : 0, jitter : 0.0 },
  roundnessDynamics :{ controller : "Off", fadeStep : 0, jitter : 0.0 },
  flipXJitter : false,
  flipYJitter : false,
};
export const BrushDefDefaultScattering:IScattering = {
  enabled : false,
  //spacing : number, //[%]???
  tipCount : 7, //doub
  bothAxes : true,
  tipCountDynamics : { controller : "Fade", fadeStep : 25, jitter : 0.0 },
  scatterDynamics : { controller : "Fade", fadeStep : 25, jitter : 0.0 }
};
export const BrushDefDefaultTexture:ITextureBrush = {
  enabled : false,
  eachTip : true,
  blendMode : "colorBurn",
  depth : 1.0, //[%]
  minimumDepth : 1.0, //[%]
  depthDynamics : { controller : "Fade", fadeStep : 25, jitter : 0.0 },
  pattern : {
    name : "Default",
    uuid : null,
  },
  scale : 1.0, //[%]
  invert : true,
};
export const BrushDefDefaultDualBrush:IDualBrush = {
  enabled : false,
  flip : true,
  tip : {
    type : "computed",
    diameter : 9, //[px]
    hardness : 1.0, //[%]
    angle : 0, // [#Ang]
    roundness : 1.0, //[%]
    spacing : 0.25, //[%]
    spacingEnabled : true,
    flipX : false,
    flipY : false,
    sampledData : null //uuid
  },
  blendMode : "colorBurn",
  useScatter : false,
  scatter : 0.0,
  scatterBothAxes : true,
  spacing : 0.25,
  count : 3,
  tipCountDynamics : { controller : "Fade", fadeStep : 25, jitter : 0.0 },
  scatterDynamics: { controller : "Fade", fadeStep : 25, jitter : 0.0 },
};
export const BrushDefDefaultColorDynamics:IColorDynamics = {
  enabled : false,
  fgBgDynamics : { controller : "Fade", fadeStep : 25, jitter : 0.0 },
  hueJitter : 0.0, //%
  satJitter : 0.0, //%
  lumJitter : 0.0, //%
  purity : 0.0, //%
};
export const BrushDefDefaultOtherDynamics:IOtherDynamics = {
  enabled : false, //usePaintDynamics
  opacityDynamics : { controller : "Fade", fadeStep : 25, jitter : 0.0 },
  flowDynamics : { controller : "Fade", fadeStep : 25, jitter : 0.0 }
};

export const BrushDefDefault:IBrushDef = {
  name : "Default",
  tip : BrushDefDefaultTip,
  tipDynamics : BrushDefDefaultTipDynamics,
  scattering : BrushDefDefaultScattering,
  texture : BrushDefDefaultTexture,
  dualBrush : BrushDefDefaultDualBrush,
  colorDynamics : BrushDefDefaultColorDynamics,
  otherDynamics : BrushDefDefaultOtherDynamics,
  brushGroup : {
    enabled : false
  },

  wetEdges : false,
  noise : false,
  airbrush : false
};

export const DocumentSettingsDefault : IDocumentSettings = {
  width : 800,
  height : 600,
  widthUnit : "pixels",
  heightUnit : "pixels",
  resolution : 72,
  resolutionUnit : "pixelsPerInch",
  backgroundContents : "white"
};

export const CanvasSizeSettingsDefault:ICanvasSizeSettings = {
  width : 1000,
  widthUnit : "pixels",
  height : 1000,
  heightUnit : "pixels",
  relative : false,
  anchorLocation : "center",
  backgroundContents : "backgroundColor"
};

export const DocumentLimitsDefault : IDocumentLimits = {
  width : { min : 1, max : 8192 },
  height : { min : 1, max : 8192 },
  resolution : { min : 1, max : 10000 }
};

export const ImageSizeSettingsDefault : IImageSizeSettings = {
  width : 1000,
  widthUnit : "pixels",
  height : 1000,
  heightUnit : "pixels",
  resampleImage : true,
  resampleQuality : "bicubic",
  constrainProportions : true,
  scaleStyles : true
};

export const HistogramDefault : IHistogram = {
  rgb : new Uint32Array(256),
  r : new Uint32Array(256),
  g : new Uint32Array(256),
  b : new Uint32Array(256)
};

export const LayerNewSettingsDefault:ILayerNewSettings = {
  type : LayerKind.NORMAL,
  adjustmentType : "levels",
  target : null,
  label : "untitled",
  clipped : false,
  color : "None",
  blendMode : "normal",
  opacity : 1.0,
  insertPosition : InsertPosition.ABOVE
};

export const FillSettingsDefault:IFillSettings = {
  fillUse : "foreground",
  blendMode : "normal",
  color: {r: 0, g: 0, b: 0},
  pattern : PatternRefDefault,
  opacity : 1.0,
  preserveTransparency : true
};

export const StrokeSettingsDefault:IStrokeSettings = {
  position : "center",
  blendMode : "normal",
  color: {r: 0, g: 0, b: 0},
  opacity : 1.0,
  width: 20,
  preserveTransparency : true
};


export const WarpSettingsDefault: IWarpSettings = {
  style: "warpNone",
  orientation : "Hrzn",
  bend: 0,
  hDist: 0,
  vDist: 0
};

export const StrokeStyleSettingsDefault: IStrokeStyleSettings = {
  version: 1,
  strokeEnabled: true,
  fillEnabled: true,
  lineWidth: 1,
  lineDashOffset: 0,
  miterLimit: 1,
  blendMode: "normal",
  lineCapType: "strokeStyleSquareCap",
  lineJoinType: "strokeStyleBevelJoin",
  lineAlignment: "strokeStyleAlignCenter",
  lineDashSet : undefined,
  opacity : 1.0,
  scaleLock : false,
  content : {
    type : "solidColor",
    data : {
      color : { r: 0, g : 0, b : 0}
    }
  },
  resolution : undefined,
  strokeAdjust : false
};

export const FillStyleSettingsDefault: IFillStyleSettings = {
  content : {
    type : "solidColor",
    data : {
      color : { r: 255, g : 255, b : 255 }
    }
  }
}

export const FillContentDefault: IFillContent = {
  type : "solidColor",
  data : {
    color : { r: 255, g : 255, b : 255 }
  }
}

export const SolidColorSettingsDefault: ISolidColorSettings = {
  color : { r: 255, g : 255, b : 255 }
}

export const GradientSettingsDefault : IGradientSettings = {
  gradient : _.cloneDeep(GradientDefDefault),
  gradientStyle : "linear",
  angle : 0,
  scale : 1.0,
  reverse : false,
  dither : false,
  alignWithLayer : true,
  offset : { x : 0, y : 0 }
}

export const PatternSettingsDefault : IPatternSettings = {
  pattern : _.cloneDeep(PatternRefDefault),
  linkWithLayer : true,
  scale : 1.0,
  phase : { x : 0, y : 0}
}

const heartPath = new PCompoundPath();
heartPath.loadState(JSON.parse('{"combinationType":1,"selection":0,"visibility":1,"children":[{"selection":0,"visibility":1,"closed":true,"segments":[{"selection":0,"visibility":1,"linked":false,"point":{"x":0.49977439641952515,"y":0.3115771412849426},"handleIn":{"x":0.12090080976486206,"y":-0.2863686680793762},"handleOut":{"x":-0.12672775983810425,"y":-0.298265278339386}},{"selection":0,"visibility":1,"linked":true,"point":{"x":0.01045083999633789,"y":0.4290838837623596},"handleIn":{"x":0.0023714303970336914,"y":-0.34617966413497925},"handleOut":{"x":-0.0013126134872436523,"y":0.19012713432312012}},{"selection":0,"visibility":1,"linked":true,"point":{"x":0.2970634698867798,"y":0.7662872672080994},"handleIn":{"x":-0.11508238315582275,"y":-0.07600677013397217},"handleOut":{"x":0.11159074306488037,"y":0.07371360063552856}},{"selection":0,"visibility":1,"linked":false,"point":{"x":0.5005214214324951,"y":0.9837627410888672},"handleIn":{"x":-0.012445390224456787,"y":-0.04292714595794678},"handleOut":{"x":0.010655462741851807,"y":-0.04205852746963501}},{"selection":0,"visibility":1,"linked":true,"point":{"x":0.7029365301132202,"y":0.7642262578010559},"handleIn":{"x":-0.10329830646514893,"y":0.07378900051116943},"handleOut":{"x":0.11294877529144287,"y":-0.08068221807479858}},{"selection":0,"visibility":1,"linked":true,"point":{"x":0.9895491600036621,"y":0.4270186424255371},"handleIn":{"x":0.0013134479522705078,"y":0.19012373685836792},"handleOut":{"x":-0.002384006977081299,"y":-0.3470398187637329}}]}]}'));
export const CustomShapeDefault : IShapeDef = {
  name : "heart",
  uuid : "$e06d65dd-d132-11d5-9a4a-a011a4cb2b2",
  paths : [heartPath],
  bbox : { left:0, right:10, top:0, bottom:10 }
}