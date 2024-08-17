import {Image} from "./Image";
import {StreamReader} from "./StreamReader";
import {Header} from "./Header";
import {ColorModeData} from "./ColorModeData";
import {Color} from "./Color";
import {ImageRLE} from "./ImageRLE";
import {ImageRAW} from "./ImageRAW";
import {StreamWriter} from "./StreamWriter";
import {CompressionMethod} from "./EnumCompressionMethod";
import {Channels} from "../../Storage/StorageUtils";
import {Buffer1} from "../../Storage/Buffer1";

export class PSDImageData {

  private _offset:number = 0;
  private _length:number = 0;

  compressionMethod:CompressionMethod = CompressionMethod.RAW;
  image:Image|null = null;

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, header:Header) {
    this._offset = stream.tell();
    this.compressionMethod = stream.readUint16();

    switch (this.compressionMethod) {
      case CompressionMethod.RAW:
        this.image = new ImageRAW();
        break;
      case CompressionMethod.RLE:
        this.image = new ImageRLE();
        break;
      default:
        throw new Error('unknown compression method');
    }
    this.image.parse(stream, header);

    this._length = stream.tell() - this._offset;
  };
  
  write(stream:StreamWriter, header?:Header) {
    if(!this.image) {
      console.warn("image is null");
      return;
    }
    stream.writeUint16(this.compressionMethod);
    this.image.write(stream, header);
  }

  /**
   * Extract RGBA channel data from canvas.
   * @param canvas
   * @returns
   */
  createChannels(canvas:HTMLCanvasElement):void {
    let ctx = canvas.getContext("2d");
    let width:number = canvas.width;
    let height:number = canvas.height;
    let imageData:ImageData|null = null;
    let pixelArray : Uint8ClampedArray|null = null;
    ctx && (imageData = ctx.getImageData(0,0,canvas.width,canvas.height));
    imageData && (pixelArray = imageData.data);

    if (width === 0 || height === 0) {
      return;
    }

    this.image = new ImageRLE();
    this.image.channel.push(new Uint8Array(width*height));
    this.image.channel.push(new Uint8Array(width*height));
    this.image.channel.push(new Uint8Array(width*height));
    this.image.channel.push(new Uint8Array(width*height));

    if(pixelArray) {
      let i = 0;
      for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
          let index = (y * width + x);
          this.image.channel[0][i] = pixelArray[index * 4 + 3];
          this.image.channel[1][i] = pixelArray[index * 4];
          this.image.channel[2][i] = pixelArray[index * 4 + 1];
          this.image.channel[3][i] = pixelArray[index * 4 + 2];
          i++;
        }
      }
    }
  }


  createComponentChannels(header:Header, colorModeData:ColorModeData):Channels|null {
    if(!this.image) return null;
    let width:number = header.columns;
    let height:number = header.rows;
    let color = new Color(header, colorModeData, this.image.channel).toRGB();

    if (width <= 0 || height <= 0) {
      return null;
    }

    return {
      r : new Buffer1(width, height, color[0]),
      g : new Buffer1(width, height, color[1]),
      b : new Buffer1(width, height, color[2]),
      a : null //TODO: support alpha channels.
    };
  };
}