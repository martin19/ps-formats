import {StreamReader} from "./StreamReader";
import {LayerRecord, LayerRecordInfo} from "./LayerRecord";
import {StreamWriter} from "./StreamWriter";
import {Header} from "./Header";

export abstract class ChannelImage {
  channel : Uint8Array = new Uint8Array(0);
  abstract parse(stream:StreamReader, header:Header, layerRecord:LayerRecord, layerRecordInfo:LayerRecordInfo, length:number):void;
  abstract write(stream:StreamWriter, width : number, height : number):number;
}