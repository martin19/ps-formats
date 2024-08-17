// import {IPatternRef} from "../Utils/Pattern";
import {LayerKind} from "../Layer/EnumLayerType";
import {IGradientSettings, IPatternSettings, ISolidColorSettings} from "../Adjustments/GLAdjustmentTypes";
import {PCompoundPath} from "../PPath/PCompoundPath";
import {Rect} from "../Utils/Rect";
import {Vector2} from "../Utils/Vector2";
import {Descriptor} from "../Data/psd/Descriptor";
import {InsertPosition} from "../Layer/EnumReorderPosition";
import {Doc} from "../AppSoodler/Doc";
import {Buffer4} from "../Storage/Buffer4";

export type Channel = "A"|"B"|"Black"|"Blue"|"Cyan"|"Duotone"|"Gray"|"Green"|"Lightness"|"Magenta"|"Monotone"|"Quadtone"|"Red"|"Tritone"|"Yellow";
export type Knockout = "none"|"shallow"|"deep";
export type BlendMode = "passThrough"|"normal"|"behind"|"dissolve"|"darken"|"multiply"|"colorBurn"|"linearBurn"|"darkerColor"|"lighten"|"screen"|"colorDodge"|"linearDodge"|"lighterColor"|"overlay"|"softLight" |"hardLight"|"vividLight"|"linearLight"|"pinLight"|"hardMix"|"difference"|"exclusion"|"subtract"|"divide"|"hue"|"saturation"|"color"|"luminosity"|"clear";
export type TechniqueGlow = "softer"|"precise";
export type SourceGlow = "edge"|"center";
export type BevelEmbossStyle = "innerBevel"|"outerBevel"|"emboss"|"pillowEmboss"|"strokeEmboss";
export type BevelEmbossDirection = "up"|"down";
export type BevelEmbossTechnique = "smooth"|"chiselHard"|"chiselSoft";
export type BevelEmbossLightingMode = "shadows"|"highlights";
export type BevelEmbossInnerOuter = "inner"|"outer";
export type GradientStyle = "linear"|"radial"|"angular"|"mirror"|"diamond";
export type StrokePosition = "inside"|"outside"|"center";
export type FillType = "color"|"gradient"|"pattern";
export type LineCapType = "strokeStyleButtCap"|"strokeStyleSquareCap"|"strokeStyleRoundCap";
export type LineJoinType = "strokeStyleMiterJoin"|"strokeStyleRoundJoin"|"strokeStyleBevelJoin";
export type LineAlignmentType = "strokeStyleAlignInside"|"strokeStyleAlignCenter"|"strokeStyleAlignOutside";
export type LayerStyleType = "dropShadow"|"innerShadow"|"outerGlow"|"innerGlow"|"bevelEmboss"|"satin"|"patternOverlay"|"gradientOverlay"|"colorOverlay"|"stroke";

export type AdjustmentType = "brightnessContrast"|"channelMixer"|"colorBalance"|"curves"|"exposure"|"gradientMap"|"historgram"|"hueSaturation"|"invert"|"levels"|"photoFilter"|"posterize"|"selectiveColor"|"threshold"|"vibrance"|"colorLookup"|"solidColor"|"gradient"|"pattern"|"blackWhite";

export const KnockoutArray:Array<string> = ["none","shallow","deep"];
export const TechniqueArray:Array<string> = ["softer","precise"];
export const InnerGlowSourceArray:Array<string> = ["center","edge"];
export const BevelEmbossStyleArray:Array<string> = ["innerBevel","outerBevel","emboss","pillowEmboss","strokeEmboss"];
export const BevelEmbossTechniqueArray:Array<string> = ["smooth","chiselHard","chiselSoft"];
export const BevelEmbossDirectionArray:Array<string> = ["up","down"];
export const GradientStyleArray:Array<string> = ["linear","radial","angular","mirror","diamond"];
export const StrokePositionArray:Array<string> = ["inside","outside","center"];
export const StrokeFillTypeArray:Array<string> = ["color","gradient","pattern"];

export const BlendModeLayerArray:Array<string> = ["normal","dissolve","darken","multiply","colorBurn","linearBurn","darkerColor","lighten","screen","colorDodge","linearDodge","lighterColor","overlay","softLight","hardLight","vividLight","linearLight","pinLight","hardMix","difference","exclusion","subtract","divide","hue","saturation","color","luminosity"];
export const BlendModeGroupArray:Array<string> = ["passThrough","normal","dissolve","darken","multiply","colorBurn","linearBurn","darkerColor","lighten","screen","colorDodge","linearDodge","lighterColor","overlay","softLight","hardLight","vividLight","linearLight","pinLight","hardMix","difference","exclusion","subtract","divide","hue","saturation","color","luminosity"];
export const BlendModeBrushPrimaryArray = ["normal","dissolve","behind","clear","darken","multiply","colorBurn","linearBurn","darkerColor","lighten","screen","colorDodge","linearDodge","lighterColor","overlay","softLight" ,"hardLight","vividLight","linearLight","pinLight","hardMix","difference","exclusion","subtract","divide","hue","saturation","color","luminosity"];
export const BlendModeBrushSecondaryArray = ["multiply","darken","overlay","colorDodge","colorBurn","linearBurn","hardMix"];
export const BlendModeBrushTextureArray = ["multiply","subtract","darken","overlay","colorDodge","colorBurn","linearBurn","hardMix"];

export type EyedropperSampleType = "1x1"|"3x3"|"5x5";
export const EyedropperSampleTypeArray = ["1x1","3x3","5x5"];

export enum DistanceTransformType {
  InnerInside = 0,
  InnerOutside = 1,
  OuterInside = 2,
  OuterOutside = 3,
  CenterInside = 4,
  CenterOutside = 5,
  InnerInsideShadow = 6,
  InnerOutsideShadow = 7,
}

export interface ITexture extends WebGLTexture {
  id?:number;
  width:number;
  height:number;
}

export interface Color {
  /**
   * red 0..255
   */
  r:number;
  /**
   * green 0..255
   */
  g:number;
  /**
   * blue 0..255
   */
  b:number;
}

export interface BlendRange {
  channel : Channel;
  srcMinBlack : number;
  srcMaxBlack : number;
  srcMinWhite : number;
  srcMaxWhite : number;
  dstMinBlack : number;
  dstMaxBlack : number;
  dstMinWhite : number;
  dstMaxWhite : number;
}

export interface EffectOptions {
  enabled? : boolean;
  available? : boolean;
}

export interface EffectBevelEmbossOptions extends EffectOptions {
  lightingMode:BevelEmbossLightingMode;
  innerOuter:BevelEmbossInnerOuter;

  style:BevelEmbossStyle;
  depth:number; //[1,1000]
  direction:BevelEmbossDirection;
  size:number; //[0,255]
  soften:number;
  localAngle:number; //[0, 2PI]
  localAltitude:number;
  useGlobalLight:boolean;
  highlightMode:BlendMode;
  highlightColor:Color;
  highlightOpacity:number; //[0,1]
  shadowMode:BlendMode;
  shadowColor:Color;
  shadowOpacity:number; //[0,1]
  technique:BevelEmbossTechnique;
  glossContour:IContourDef;
  glossContourAntiAlias:boolean;

  contourEnabled:boolean;
  contour:IContourDef;
  contourRange:number;//[0,1]
  contourAntiAlias:boolean;

  patternEnabled:boolean;
  pattern:IPatternRef;
  patternScale:number; //[0.01,10.0] percent
  patternDepth:number; //[-10.0,10.0] percent
  patternInvert:boolean;
  patternAlign:boolean;
  patternPhase:{x:number,y:number};
}

export interface EffectColorOverlayOptions extends EffectOptions {
  blendMode:BlendMode;
  color:Color;
  opacity:number;
}

export interface EffectGlowOptions extends EffectOptions{
  blendMode:BlendMode;
  noise:number;
  spread:number;
  size:number;
  technique:TechniqueGlow;
  source?:SourceGlow;
  fillType:FillType;
  color:Color;
  gradient?:IGradientDef;
  opacity:number;
  contour:IContourDef;
  contourRange:number;
  contourJitter:number;
  contourAntiAlias:boolean;
}

export interface EffectGradientOverlayOptions extends EffectOptions {
  blendMode:BlendMode;
  gradient:IGradientDef;
  gradientType:GradientStyle;
  reverse:boolean;
  offset:{x:number,y:number};
  opacity:number;
  alignWithLayer:boolean;
  angle:number;
  scale:number;
}

export interface EffectPatternOverlayOptions extends EffectOptions {
  blendMode:BlendMode;
  opacity:number;
  alignToLayer:boolean;
  pattern:IPatternRef;
  patternScale:number; //[1,1000] percent
  patternPhase:{x:number,y:number};
}

export interface EffectSatinOptions extends EffectOptions {
  blendMode:BlendMode;
  color:Color;
  opacity:number;
  angle:number;
  distance:number;
  size:number;
  contour:IContourDef;
  contourAntiAlias:boolean;
  invert:boolean;
}


export interface EffectShadowOptions extends EffectOptions {
  color:Color;
  blendMode:BlendMode;
  opacity:number; //[0,1]
  localAngle:number;
  useGlobalLight:boolean;
  distance:number; // [0,255]
  spread:number; // [0,100]
  size:number; // [0,255]
  contour:IContourDef;
  contourAntiAlias:boolean;
  contourNoise:number; //[0,1]
}


export interface EffectStrokeOptions extends EffectOptions {
  innerOuter:BevelEmbossInnerOuter;

  blendMode:BlendMode;
  opacity:number;
  size:number;
  position:StrokePosition;
  fillType : FillType;
  color:{r:number,g:number,b:number};

  gradient : IGradientDef;
  gradientType : GradientStyle;
  gradientAngle : number;
  gradientScale : number;
  gradientReverse : boolean;
  gradientAlignWithLayer:boolean;
  gradientOffset: {x:number,y:number};
  gradientDither: boolean;

  pattern : IPatternRef;
  patternScale : number;
  patternLinkedWithLayer : boolean;
  patternPhase :{x:number,y:number};
}

export interface ILayerEffectConfig {
  masterFXSwitch? : boolean;
  folderOpen? : boolean;
  dropShadow? : EffectShadowOptions;
  innerShadow? : EffectShadowOptions;
  outerGlow? : EffectGlowOptions;
  innerGlow? : EffectGlowOptions;
  bevelEmboss? : EffectBevelEmbossOptions;
  satin? : EffectSatinOptions;
  patternOverlay? : EffectPatternOverlayOptions;
  gradientOverlay? : EffectGradientOverlayOptions;
  colorOverlay? : EffectColorOverlayOptions;
  stroke? :EffectStrokeOptions;
}

export interface ILayerBlendConfig {
  opacity : number;
  blendMode : BlendMode;
  blendRanges : BlendRange[];
  fillOpacity : number;
  blendClippedAsGroup? : boolean;
  blendInteriorAsGroup? : boolean;
  knockout? : Knockout;
  transparencyShapesLayer? : boolean;
  layerMaskAsGlobalMask? : boolean;
  vectorMaskAsGlobalMask? : boolean;
  referencePoint? : { x : number, y : number };
  channelRestrictions? : number[];
}

//////////////////////////////////////////////

export type BrushVariationController = "Off"|"Fade"|"PenPressure"|"PenTilt"|"StylusWheel"|"Rotation"|"InitialDirection"|"Direction";

export interface BrushVariationControl {
  controller : BrushVariationController; //long
  fadeStep : number; //long
  jitter : number; //[%]
}

export interface IBrushTip {
  type : "sampled"|"computed";
  diameter : number; //[px]
  hardness : number; //[%]
  angle : number; // [#Ang]
  roundness : number; //[%]
  spacing : number; //[%]
  spacingEnabled : boolean;
  flipX : boolean;
  flipY : boolean;
  sampledData : string|null; //uuid
}

export interface ITipDynamics {
  enabled : boolean;
  minimumDiameter : number; //[%]
  minimumRoundness : number; //[%]
  tiltScale : number; //[%]
  sizeDynamics : BrushVariationControl;
  angleDynamics : BrushVariationControl;
  roundnessDynamics : BrushVariationControl;
  flipXJitter : boolean;
  flipYJitter : boolean;
}

export interface IScattering {
  enabled : boolean;
  //spacing : number; //[%]
  tipCount : number; //doub
  bothAxes : boolean;
  tipCountDynamics : BrushVariationControl;
  scatterDynamics : BrushVariationControl;
}

export interface ITextureBrush {
  enabled : boolean;
  eachTip : boolean;
  blendMode : BlendMode;
  depth : number; //[%]
  minimumDepth : number; //[%]
  depthDynamics : BrushVariationControl;
  pattern : {
    name : string;
    uuid : string|null;
  }
  scale : number; //[%]
  invert : boolean;
}

export interface IDualBrush {
  enabled : boolean;
  flip : boolean;
  tip : IBrushTip;
  blendMode : BlendMode;
  useScatter : boolean;
  scatter : number;
  spacing : number;
  count : number;
  scatterBothAxes : boolean;
  scatterDynamics : BrushVariationControl;
  tipCountDynamics : BrushVariationControl;
}

export interface IColorDynamics {
  enabled : boolean;
  fgBgDynamics : BrushVariationControl;
  hueJitter : number; //%
  satJitter : number; //%
  lumJitter : number; //%
  purity : number; //%
}

export interface IOtherDynamics {
  enabled : boolean; //usePaintDynamics
  opacityDynamics : BrushVariationControl;
  flowDynamics : BrushVariationControl;
}

export interface IBrushDef {
  name : string;

  tip : IBrushTip;
  tipDynamics? : ITipDynamics;
  scattering? : IScattering;
  texture? : ITextureBrush;
  dualBrush? : IDualBrush ;
  colorDynamics? : IColorDynamics;
  otherDynamics? : IOtherDynamics;
  brushGroup? : {
    enabled : boolean;
  }

  wetEdges? : boolean;
  noise? : boolean;
  airbrush? : boolean;
  smoothing? : boolean;
  protectTexture? : boolean;
}

export interface IPatternDef {
  uuid : string;
  name : string;
  url : string;
}

export interface IPatternRef {
  name : string;
  uuid : string|null;
}

export interface ISwatchDef {
  name : string;
  r : number;
  g : number;
  b : number;
  type? : "global"|"spot"|"normal";
  groupName? : string;
}

export interface IShapeDef {
  uuid : string;
  name : string;
  bbox? : { top : number, left : number, bottom : number, right : number };
  paths : PCompoundPath[];
}

export interface IStyleDef {
  uuid : string;
  name : string;
  config : ILayerEffectConfig;
}

export interface IStrokeDef {
  lineWidth?: number;
  lineDashOffset?: number;
  miterLimit?: number;
  lineCapType?: LineCapType;
  lineJoinType?: LineJoinType;
  lineAlignment?: LineAlignmentType;
  lineDashSet?: number[];
}

export type ColorStopType = "userStop"|"backgroundColor"|"foregroundColor";
export interface ColorStop {
  location:number; //0 to 4096 (0% to 100%).
  midpoint?:number; //0 to 100
  type:ColorStopType;
  color:Color;
}

export interface AlphaStop {
  location:number; //0 to 4096 (0% to 100%).
  midpoint?:number; //0 to 100
  alpha:number;
}

export interface IGradientDef {
  name:string;
  colorStops:Array<ColorStop>;
  alphaStops:Array<AlphaStop>;
  hash?:number;
}

export interface IContourDef {
  name : string,
  x:number[],
  y:number[],
  c:boolean[],
  minInputRange?:number;
  maxInputRange?:number;
  hash?:number
}

export interface ICurveDef {
  x:number[],
  y:number[],
  c?:boolean[],
  hash?:number
}

export interface IMapDef {
  x:number[],
  y:number[],
  hash?:number
}

export interface ICharacterFormatting {
  size?: number;
  baselineShift?: number;
  verticalScaling?:number;
  horizontalScaling?:number;
  autoLeading?: boolean;
  leading?: number;
  font?: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikeout?: boolean;
  align?: string;
  script?: string;
  fontCaps?: number;
  autoKerning?: boolean;
  kerning?: number;
  tracking?: number;
}

export type ParagraphAlignment = "left"|"center"|"right"|"justifyLastLeft"|"justifyLastCentered"|"justifyLastRight"|"justifyAll";

export interface IParagraphFormatting {
  align? : ParagraphAlignment;
  firstLineIndent? : number;
  startIndent? : number;
  endIndent? : number;
  spaceBefore? : number;
  spaceAfter? : number;
}

/////////////////////////////////////

export const DocumentDimensionUnitArray:DocumentDimensionUnit[] = ["pixels","inches","cm","points","picas"];
export const DocumentResizeUnitArray = ["pixels","percent"];
export const DocumentResolutionUnitArray:DocumentResolutionUnit[] = ["pixelsPerInch","pixelsPerCm"];
export const DocumentBackgroundContentsArray = ["white","backgroundColor","transparent"];
export const DocumentAnchorLocationArray = ["center","topLeft","top","topRight","right","bottomRight","bottom","bottomLeft","left"];

export type DocumentDimensionUnit = "pixels"|"inches"|"cm"|"points"|"picas";
export type DocumentResizeUnit = "pixels"|"percent";
export type DocumentResolutionUnit = "pixelsPerInch"|"pixelsPerCm";
export type DocumentBackgroundContents = "white"|"backgroundColor"|"transparent";
export type DocumentAnchorLocation = "center"|"topLeft"|"top"|"topRight"|"right"|"bottomRight"|"bottom"|"bottomLeft"|"left";

export interface IDocumentSettings {
  width : number;
  height : number;
  widthUnit : DocumentDimensionUnit;
  heightUnit : DocumentDimensionUnit;
  resolution : number;
  resolutionUnit : DocumentResolutionUnit;
  backgroundContents : DocumentBackgroundContents;
}

export interface ICanvasSizeSettings {
  width : number;
  widthUnit : DocumentDimensionUnit;
  height : number;
  heightUnit : DocumentDimensionUnit;
  relative : boolean;
  anchorLocation : DocumentAnchorLocation;
  backgroundContents : DocumentBackgroundContents;
}

export interface IDocumentLimits {
  width : { max : number, min : number },
  height : { max : number, min : number },
  resolution : { max : number, min : number }
}

export enum CanvasRotateType {
  cw180 = 0,
  cw90 = 1,
  ccw90 = 2,
  flipHorizontal = 3,
  flipVertical = 4,
  arbitrary = 5
}

export enum ResampleType {
  nearestNeighbor = 0,
  bilinear = 1,
  bicubic = 2,
  bicubicSmoother = 3,
  bicubicSharper = 4
}

export interface IImageSizeSettings {
  width : number;
  widthUnit : DocumentResizeUnit;
  height : number;
  heightUnit : DocumentResizeUnit;
  scaleStyles : boolean;
  constrainProportions : boolean;
  resampleImage : boolean;
  resampleQuality : TransformQuality;
}

export interface IHistogram {
  rgb : Uint32Array;
  r : Uint32Array;
  g : Uint32Array;
  b : Uint32Array;
}

export enum HistogramKind {
  entireImage = 0,
  selectedPixels = 1,
  adjustmentComposite = 2
}

export const LayerColorArray:LayerColor[] = ["None", "Red", "Orange", "Yellow", "Green", "Blue", "Violet", "Gray"];

export type LayerColor = "None"|"Red"|"Orange"|"Yellow"|"Green"|"Blue"|"Violet"|"Gray";

export interface ILayerNewSettings {
  id? : string
  type : LayerKind,
  adjustmentType : AdjustmentType,
  target : string|null,
  label : string,
  clipped : boolean;
  color : LayerColor,
  blendMode : BlendMode,
  opacity : number,
  locked? : boolean,
  insertPosition : InsertPosition,
}

// export const FillUseArray = ["Foreground Color","Background color","Custom color","Pattern","White","Gray","Black"];
export const FillUseArray = ["foreground","background","color","pattern","white","gray","black"];
export type FillUse = "foreground"|"background"|"color"|"pattern"|"white"|"gray"|"black";


export interface IFillSettings {
  fillUse : FillUse,
  pattern : IPatternRef,
  color : Color,
  blendMode : BlendMode,
  opacity : number,
  preserveTransparency : boolean;
}

export interface IStrokeSettings {
  width : number;
  color : Color;
  position : StrokePosition;
  blendMode : BlendMode;
  opacity : number;
  preserveTransparency : boolean;
}

export type WarpStyle = "warpNone"|"warpCustom"|"warpArc"|"warpArcLower"|"warpArcUpper"|"warpArch"|"warpBulge"|"warpShellLower"|"warpShellUpper"|"warpFlag"|"warpWave"|"warpFish"|"warpRise"|"warpFisheye"|"warpInflate"|"warpSqueeze"|"warpTwist";
export type WarpOrientation = "Hrzn"|"Vrtc";
export const WarpOrientationArray = ["Hrzn","Vrtc"];
export const WarpStyleArray:WarpStyle[] = ["warpNone","warpCustom","warpArc","warpArcLower","warpArcUpper","warpArch","warpBulge","warpShellLower","warpShellUpper","warpFlag","warpWave","warpFish","warpRise","warpFisheye","warpInflate","warpSqueeze","warpTwist"];

export interface IWarpSettings {
  style: WarpStyle;
  orientation: WarpOrientation;
  bend: number;
  hDist: number;
  vDist: number;
  bounds?: { left : number, top : number, right : number, bottom : number };
  customEnvelopeWarp?: { x : number, y : number }[];
  uOrder? : number;
  vOrder? : number;
}

export type TransformQuality = "nearest"|"bilinear"|"bicubic";
export const TransformQualityArray = ["nearest","bilinear","bicubic"];


export type PathCreateType = "shape"|"path"|"pixels";
export type PathBooleanOp = "new"|"union"|"exclude"|"subtract"|"intersect";
export const PathBooleanOpArray = ["exclude","union","subtract","intersect"];
export type PathOrderOp = "forward"|"backward"|"toFront"|"toBack";
export type AlignmentOp = "align-top-edges"|
  "align-vertical-centers"|
  "align-bottom-edges"|
  "align-left-edges"|
  "align-horizontal-centers"|
  "align-right-edges"|

  "distribute-top-edges"|
  "distribute-vertical-centers"|
  "distribute-bottom-edges"|
  "distribute-left-edges"|
  "distribute-horizontal-centers"|
  "distribute-right-edges"|

  "distribute-widths"|
  "distribute-heights";

export interface IStrokeStyleSettings {
  version?: number;
  strokeEnabled?: boolean;
  fillEnabled?: boolean;
  lineWidth?: number;
  lineDashOffset?: number;
  miterLimit?: number;
  lineCapType?: LineCapType;
  lineJoinType?: LineJoinType;
  lineAlignment?: LineAlignmentType;
  scaleLock?: boolean;
  strokeAdjust?: boolean;
  lineDashSet?: number[];
  blendMode?: BlendMode;
  opacity?: number;
  content?: IFillContent;
  resolution?: number;
}

export interface IFillStyleSettings {
  content?: IFillContent;
}

export interface IFillContent {
  type: "none" | "solidColor" | "gradient" | "pattern",
  data?: ISolidColorSettings | IPatternSettings | IGradientSettings
}

export interface ISmartObjectPlacementData {
  idnt? : string;
  placed? : string;
  page? : number;
  totalPages? : number;
  frameStep? : {
    numerator? : number;
    denominator? : number;
  };
  duration? : {
    numerator? : number;
    denominator? : number;
  };
  frameCount? : number;
  annt? : number;
  type? : number;
  transform? : number[];
  nonAffineTransform? : number[];
  warp? : IWarpSettings;
  size? : { w : number, h : number };
  rslt? : number;
}

export interface ILinkedLayerInfo {
  type? : "liFD"|"liFE"|"liFA";
  version? : number;
  uuid : string;
  fileName : string;
  fileType? : string;
  fileCreator? : string;
  fileSize? : number;
  fileOpenDescriptor? : number;
  fileParameterDescriptor? : Descriptor;
  linkedFileParameterDescriptor? : Descriptor;
  timestamp? : {
    year : number;
    month : number;
    day : number;
    hour : number;
    minute : number;
    seconds : number;
  }
  fileData? : Uint8Array;
  childDocumentId? : string;
  assetModTime? : number;
  assetLocked? : boolean;
  doc? : Doc|null;
  imageFullSize? : Buffer4|null;
  texFullSize? : ITexture|null;
}