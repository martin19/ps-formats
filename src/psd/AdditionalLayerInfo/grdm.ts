import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {StreamWriter} from "../StreamWriter";
import {AlphaStop, ColorStop, IGradientDef} from "../../../Effects/GLTypes";

interface IGradientMapSettings {
  gradientDef : IGradientDef;
  dither : boolean;
  reverse : boolean;
}

export class grdm implements IAdditionalLayerInfoBlock {

  private _offset : number = 0;
  private _length : number = 0;

  version : number = 0;
  settings:IGradientMapSettings = {
    gradientDef : {
      name:"",
      colorStops:[],
      alphaStops:[],
    },
    dither : false,
    reverse : false
  };

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  static create(settings:IGradientMapSettings) {
    let _grdm = new grdm();
    _grdm.settings = settings;
    return _grdm;
  }

  parse(stream : StreamReader, length? : number, header? : Header) {
    this._offset = stream.tell();

    this.settings = {
      gradientDef : {
        name:"Default",
        colorStops:[],
        alphaStops:[],
      },
      dither : false,
      reverse : false
    };
    this.version = stream.readUint16();
    this.settings.reverse = stream.readUint8() == 1;
    this.settings.dither = stream.readUint8() == 1;
    let len = stream.readUint32();
    this.settings.gradientDef.name = stream.readWideString(len);
    let colorStops = stream.readUint16();
    let alphaStops : number;
    for(let i = 0; i < colorStops; i++) {
      let stop : ColorStop = {
        location:0,
        midpoint:0,
        type:"userStop",
        color:{r:0,g:0,b:0}
      };
      stop.location = stream.readUint32()/4096;
      stop.midpoint = stream.readUint32()/100;
      let colorMode = stream.readUint16();
      stop.color.r = stream.readUint16()/0xFF;
      stop.color.g = stream.readUint16()/0xFF;
      stop.color.b = stream.readUint16()/0xFF;
      let black = stream.readUint16();
      alphaStops = stream.readUint16();
      this.settings.gradientDef.colorStops.push(stop);
    }
    alphaStops = stream.readUint16();
    for(let i = 0; i < alphaStops; i++) {
      let stop:AlphaStop = {
        location:0,
        midpoint:0,
        alpha:0
      };
      stop.location = stream.readUint32()/4096;
      stop.midpoint = stream.readUint32()/100;
      stop.alpha = stream.readUint16()/0xFF;
      this.settings.gradientDef.alphaStops.push(stop);
    }

    //stuff
    let expansionCount = stream.readUint16();
    let interpolation = stream.readUint16();
    let gradientLength = stream.readUint16();
    let mode = stream.readUint16(); //??
    let seed = stream.readUint32();
    let showTransparency = stream.readUint16();
    let useVectorColor = stream.readUint16();
    let roughness = stream.readUint32();
    let colorModel = stream.readUint16();
    let minimumColorValues = {
      r : stream.readUint16(),
      g : stream.readUint16(),
      b : stream.readUint16(),
      a : stream.readUint16(),
    };
    let maximumColorValues = {
      r : stream.readUint16(),
      g : stream.readUint16(),
      b : stream.readUint16(),
      a : stream.readUint16(),
    };
    let dummy = stream.readUint16();

    this._length = stream.tell() - this._offset;
  }

  write(stream : StreamWriter) {
    stream.writeUint16(1); //version
    stream.writeUint8(this.settings.reverse ? 1 : 0);
    stream.writeUint8(this.settings.dither ? 1 : 0);
    stream.writeUint32(this.settings.gradientDef.name.length);
    stream.writeWideString(this.settings.gradientDef.name);

    let colorStopCount = this.settings.gradientDef.colorStops.length;
    let alphaStopCount = this.settings.gradientDef.alphaStops.length;
    stream.writeUint16(colorStopCount);
    for(let i = 0; i < colorStopCount; i++) {
      let stop = this.settings.gradientDef.colorStops[i];
      stream.writeUint32(stop.location*4096);
      stream.writeUint32(typeof stop.midpoint !== "undefined" ? stop.midpoint*100.0 : 50);
      stream.writeUint16(0); //colorMode
      stream.writeUint16(stop.color.r * 255);
      stream.writeUint16(stop.color.g * 255);
      stream.writeUint16(stop.color.b * 255);
      stream.writeUint16(0); //black
      stream.writeUint16(0); //alpha stop count? dunno.
    }
    stream.writeUint16(alphaStopCount);
    for(let i = 0; i < alphaStopCount; i++) {
      let stop = this.settings.gradientDef.alphaStops[i];
      stream.writeUint32(stop.location*4096);
      stream.writeUint32(typeof stop.midpoint !== "undefined" ? stop.midpoint*100.0 : 50);
      stream.writeUint16(stop.alpha*255);
    }

    stream.writeUint16(2); //expansion count
    stream.writeUint16(4096); //Interpolation if length above is non-zero
    stream.writeUint16(32); //Length (= 32 for Photoshop 6.0)
    stream.writeUint16(0); //mode for this gradient
    stream.writeUint32(37524100); //Random number seed
    stream.writeUint16(0); //Flag for showing transparency ???
    stream.writeUint16(0); //Flag for using vector color
    stream.writeUint32(2048); //Roughness factor
    stream.writeUint32(3); //color model
    stream.writeUint16(0); //minimum color values
    stream.writeUint16(0); //minimum color values
    stream.writeUint16(0); //minimum color values
    stream.writeUint16(0); //minimum color values
    stream.writeUint16(32768); //maximum color values
    stream.writeUint16(32768); //maximum color values
    stream.writeUint16(32768); //maximum color values
    stream.writeUint16(32768); //maximum color values
    stream.writeUint16(0); //Dummy: not used in Photoshop 6.0
  }
}