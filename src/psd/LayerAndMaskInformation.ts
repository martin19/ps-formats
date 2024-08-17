import {LayerInfo} from "./LayerInfo";
import {GlobalLayerMaskInfo} from "./GlobalLayerMaskInfo";
import {AdditionalLayerInfo} from "./AdditionalLayerInfo";
import {StreamReader} from "./StreamReader";
import {Header} from "./Header";
import {StreamWriter} from "./StreamWriter";
import {Buffer4} from "../../Storage/Buffer4";
import {Buffer1} from "../../Storage/Buffer1";
export class LayerAndMaskInformation {

  private _offset:number = 0;
  private _length:number = 0;

  layerInfo!:LayerInfo;
  globalLayerMaskInfo!:GlobalLayerMaskInfo;
  additionalLayerInfo:AdditionalLayerInfo[] = [];

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, header:Header) {
    let length:number;

    this._offset = stream.tell();
    if(header.version === 2) {
      length = stream.readUint64();
      this._length = length + 8;
    } else {
      length = stream.readUint32();
      this._length = length + 4;
    }

    if (length === 0) {
      window.console.log("skip: layer and mask information (empty body)");
    }

    let pos = stream.tell() + length;

    // initialize
    this.layerInfo = new LayerInfo();
    this.globalLayerMaskInfo = new GlobalLayerMaskInfo();
    this.additionalLayerInfo = [];

    // parse
    this.layerInfo.parse(stream, header);
    this.globalLayerMaskInfo.parse(stream, header);

    while (stream.tell() < pos) {
      let additionalLayerInfo = new AdditionalLayerInfo();
      additionalLayerInfo.parse(stream, header);
      this.additionalLayerInfo.push(additionalLayerInfo);
    }

    // TODO: remove
    stream.seek(pos, 0);
  }

  write(stream:StreamWriter, header:Header, layerImageData : (Buffer4|null)[],
        layerMaskData : (Buffer1|null)[], layerMaskDataReal : (Buffer1|null)[]) {
    let ipLength = stream.tell();
    stream.writeUint32(42); //length

    let ipDataStart = stream.tell();

    this.layerInfo?.write(stream, header, layerImageData, layerMaskData, layerMaskDataReal);
    this.globalLayerMaskInfo?.write(stream, header);
    this.additionalLayerInfo.forEach(info => {
      info.write(stream, header);
    });
    let ipDataEnd = stream.tell();

    let length = ipDataEnd - ipDataStart;

    //write length field.
    let ipNow = stream.tell();
    stream.seek(ipLength, 0);
    stream.writeUint32(ipDataEnd - ipDataStart);
    stream.seek(ipNow, 0);

    return length;
  }
}