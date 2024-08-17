import {ChannelImage} from "./ChannelImage";
import {StreamReader} from "./StreamReader";
import {LayerRecord, LayerRecordInfo} from "./LayerRecord";
import {StreamWriter} from "./StreamWriter";
import {CompressionMethod} from "./EnumCompressionMethod";
import {Header} from "./Header";

export class ChannelRAW extends ChannelImage {

  constructor() {
    super();
  }

  parse(stream:StreamReader, header:Header, layerRecord:LayerRecord, layerRecordInfo:LayerRecordInfo, length:number) {
    let width = layerRecord.right - layerRecord.left;
    let height = layerRecord.bottom - layerRecord.top;

    //this.channel = stream.read(width * height);
    this.channel = stream.read(length) as Uint8Array;
  }

  write(stream:StreamWriter, width : number, height : number) {
    let ipDataStart = stream.tell();

    stream.writeUint16(CompressionMethod.RAW);
    stream.write(this.channel);
    let ipDataEnd = stream.tell();
    return ipDataEnd - ipDataStart;
  }

  getLength() {
    return this.channel.length;
  }
}