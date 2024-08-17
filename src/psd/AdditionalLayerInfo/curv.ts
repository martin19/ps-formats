import * as _ from 'lodash';
import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {StreamWriter} from "../StreamWriter";
import {AdjustmentDefaultCurves} from "../../../Adjustments/GLAdjustmentDefaults";

interface ICurveDef {
  x:number[],
  y:number[],
  c?:boolean[]
}

interface IMapDef {
  x:number[],
  y:number[]
}

interface ICurveOrMap {
  data : IMapDef|ICurveDef;
}

interface ICurvesSettings {
  type : "curve"|"map";
  curveOrMap : {[channel:string]:ICurveOrMap};
}


function getBitCount (value:number) {
  let count = 0;
  while (value > 0) {         // until all bits are zero
    if ((value & 1) === 1)     // check lower bit
      count++;
    value >>= 1;              // shift bits, removing lower bit
  }
  return count;
}

function getBitIndices (value:number):number[] {
  let index = 0;
  let indices:number[] = [];
  while (value > 0) {         // until all bits are zero
    if ((value & 1) === 1) {
      indices.push(index);
    }
    value >>= 1;              // shift bits, removing lower bit
    index++;
  }
  return indices;
}

function setBitIndices(indices:number[]) {
  let bitmap = 0;
  for(let i = 0; i < indices.length; i++) {
    bitmap |= (1 << indices[i]);
  }
  return bitmap;
}

export class curv implements IAdditionalLayerInfoBlock {

  private _offset : number = 0;
  private _length : number = 0;

  version : number = 0;
  settings : ICurvesSettings = _.cloneDeep(AdjustmentDefaultCurves)

  constructor() {
    this.settings = { type : "curve", curveOrMap : {}};
  }

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  static create(settings:ICurvesSettings) {
    let _curv = new curv();
    _curv.settings = settings;
    return _curv;
  }

  parse(stream : StreamReader, length? : number, header? : Header) {
    this._offset = stream.tell();

    let curves:{[channelIndex:string]:ICurveDef} = {};
    let maps:{[channelIndex:string]:IMapDef} = {};

    //version 1
    let type = stream.readUint8(); //0 : curv, 1 : map

    if(type == 1) {
      this.version = stream.readUint16();
      let whatever = stream.readUint16();
      let bitmap = stream.readUint16();
      let curveCount = getBitCount(bitmap);
      let channelIndices:number[] = getBitIndices(bitmap);
      for(let j = 0; j < curveCount; j++) {
        let channelIndex = channelIndices[j].toString();
        let map:IMapDef = { x : [], y : [] };
        for(let i = 0; i < 256; i++) {
          map.y.push(stream.readUint8());
          map.x.push(i);
        }
        maps[channelIndex] = map;
      }
      let marker = stream.readString(4);
      if(marker === "Crv ") {
        maps = {};
        let whatever = stream.readUint16(); //version? is 3
        let whatever1 = stream.readUint16();
        let curveCount = stream.readUint16();
        for(let j = 0; j < curveCount; j++) {
          let channelIndex = stream.readUint16().toString();
          let map:IMapDef = { x : [], y : [] };
          for(let i = 0; i < 256; i++) {
            map.y.push(stream.readUint8());
            map.x.push(i);
          }
          maps[channelIndex] = map;
        }
      }
      this.settings.type = "map";
      Object.keys(maps).forEach(key => {
        this.settings.curveOrMap[key] = { data : maps[key] };
      });
    } else
    if(type == 0) {
      this.version = stream.readUint16();
      let whatever = stream.readUint16();
      let bitmap = stream.readUint16();
      let curveCount = getBitCount(bitmap);
      let channelIndices:number[] = getBitIndices(bitmap);
      for (let j = 0; j < curveCount; j++) {
        let channelIndex = channelIndices[j].toString();
        let pointCount = stream.readUint16();
        let curve: ICurveDef = { x: [], y: [] };
        for (let i = 0; i < pointCount; i++) {
          curve.y.push(stream.readUint16());
          curve.x.push(stream.readUint16());
        }
        curves[channelIndex] = curve;
      }
      //version 1
      let marker = stream.readString(4);
      if (marker === "Crv ") {
        curves = {};
        this.version = stream.readUint16();
        let whatever = stream.readUint16();
        let curveCount = stream.readUint16();
        for (let j = 0; j < curveCount; j++) {
          let channelIndex = stream.readUint16().toString();
          let pointCount = stream.readUint16();
          let curve: ICurveDef = { x: [], y: [] };
          for (let i = 0; i < pointCount; i++) {
            curve.y.push(stream.readUint16());
            curve.x.push(stream.readUint16());
          }
          curves[channelIndex] = curve;
        }
      }
      this.settings.type = "curve";
      Object.keys(curves).forEach(key => {
        this.settings.curveOrMap[key] = { data : curves[key] };
      });
    }

    this._length = stream.tell() - this._offset;
  }

  write(stream : StreamWriter) {
    if(this.settings.type === "map") {
      stream.writeUint8(1); //curve

      stream.writeUint16(1); //version
      stream.writeUint16(0); //filler?
      let indices = Object.keys(this.settings.curveOrMap);
      let bitmap = setBitIndices(indices.map(value => parseInt(value)));
      stream.writeUint16(bitmap);
      for (let i = 0; i < indices.length; i++) {
        let curve = this.settings.curveOrMap[indices[i]].data;
        let pointCount = curve.x.length;
        for (let j = 0; j < pointCount; j++) {
          stream.writeUint8(curve.y[j]);
        }
      }
      //version 1 additional information
      stream.writeString("Crv ");
      stream.writeUint16(3);
      stream.writeUint16(0); //filler?
      stream.writeUint16(indices.length);
      for (let i = 0; i < indices.length; i++) {
        let curve = this.settings.curveOrMap[indices[i]].data;
        stream.writeUint16(parseInt(indices[i]));
        let pointCount = curve.x.length;

        for (let j = 0; j < pointCount; j++) {
          stream.writeUint8(curve.y[j]);
        }
      }
    } else
    if(this.settings.type === "curve") {
      stream.writeUint8(0); //curve

      stream.writeUint16(1); //version
      stream.writeUint16(0); //filler?
      let indices = Object.keys(this.settings.curveOrMap);
      let bitmap = setBitIndices(indices.map(value => parseInt(value)));
      stream.writeUint16(bitmap);
      for (let i = 0; i < indices.length; i++) {
        let curve = this.settings.curveOrMap[indices[i]].data;
        let pointCount = curve.x.length;
        stream.writeUint16(pointCount);
        for (let j = 0; j < pointCount; j++) {
          stream.writeUint16(curve.y[j]);
          stream.writeUint16(curve.x[j]);
        }
      }
      //version 1 additional information
      stream.writeString("Crv ");
      stream.writeUint16(4);
      stream.writeUint16(0); //filler?
      stream.writeUint16(indices.length);
      for (let i = 0; i < indices.length; i++) {
        let curve = this.settings.curveOrMap[indices[i]].data;
        stream.writeUint16(parseInt(indices[i]));
        let pointCount = curve.x.length;
        stream.writeUint16(pointCount);

        for (let j = 0; j < pointCount; j++) {
          stream.writeUint16(curve.y[j]);
          stream.writeUint16(curve.x[j]);
        }
      }
    }
  }
}