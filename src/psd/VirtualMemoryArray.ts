import {StreamReader} from "./StreamReader";
import {StreamWriter} from "./StreamWriter";
import {CompressionMethod} from "./EnumCompressionMethod";

export interface Header {
  version:number;
  length:number;
  top:number;
  left:number;
  bottom:number;
  right:number;
  channels:number;
}

export interface SkippedChannel {
  skip : boolean;
}

export interface Channel extends SkippedChannel {
  skip : boolean;
  length:number;
  depth1:number;
  top:number;
  left:number;
  bottom:number;
  right:number;
  depth2:number;
  compressionMode:CompressionMethod;
  data:Uint8Array;
}

export class VirtualMemoryArray {

  private _offset:number = 0;
  private _length:number = 0;

  version : number = 0;
  mode : number = 0;
  vertical : number = 0;
  horizontal : number = 0;
  name : string = "";
  id : string = "";

  header : Header = {
    version:0,
    length:0,
    top:0,
    left:0,
    bottom:0,
    right:0,
    channels:0
  };
  channels : (Channel|SkippedChannel)[] = [];
  colorTable?:Array<number>|Uint8Array;

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, length? : number) {
    let limit:number = stream.tell() + (typeof length === "number" ? length : 0);
    //  Number of channels + one for user mask + one for sheet mask.
    //  Make sure you loop number of channels + 2. Make sure you are skipping non written and no length arrays.
    this.channels = [];
    this.header = {
      version : stream.readInt32(),
      length : stream.readInt32(),
      top : stream.readInt32(),
      left : stream.readInt32(),
      bottom : stream.readInt32(),
      right : stream.readInt32(),
      channels : stream.readInt32()
    };
    for(let i = 0; i < this.header.channels + 2; i++) {
      const skippedChannel : SkippedChannel = {
        skip : true
      };
      this.channels.push(skippedChannel);
      skippedChannel.skip = stream.readInt32() === 0;
      if(skippedChannel.skip) continue;
      //channel contains data.
      let channel = skippedChannel as Channel;
      channel.length = stream.readInt32();
      if(channel.length == 0) continue;
      channel.depth1 = stream.readInt32();
      channel.top = stream.readInt32();
      channel.left = stream.readInt32();
      channel.bottom = stream.readInt32();
      channel.right = stream.readInt32();
      channel.depth2 = stream.readInt16();
      channel.compressionMode = stream.readInt8();
      switch (channel.compressionMode) {
        case CompressionMethod.RAW:
          channel.data = new Uint8Array(stream.read(channel.length - 23));
          break;
        case CompressionMethod.RLE:
          let height = this.header.bottom - this.header.top;
          let width = this.header.right - this.header.left;
          channel.data = VirtualMemoryArray.parseChannelRLE(stream, width, height, channel.length - 23);
          break;
        default:
          throw new Error('unsupported compression method');
      }
    }
    if(typeof length === "number") {
      stream.seek(0,limit);
    }
  }
  
  static parseChannelRLE(stream:StreamReader, width:number, height:number, length:number):Uint8Array {
    let lineLength:Array<number> = [];
    let limit:number = stream.tell() + length;
    let channel:Uint8Array;
    let i:number;
    // line lengths
    for (i = 0; i < height; ++i) {
      lineLength[i] = stream.readUint16();
    }
    channel = new Uint8Array(width * height);
    // channel data
    for (i = 0; i < height; ++i) {
      stream.readPackBits(lineLength[i], channel, width*i);
      // TODO: avoid invalid height
      if (stream.tell() >= limit) {
        break;
      }
    }
    return channel;
  }

  /**
   * Write channel as rle data
   * @param {StreamWriter} stream
   * @param {Header} header
   * @param {Channel} channel
   * @returns {number} the length of written data.
   */
  static writeChannelRLE(stream:StreamWriter, header : Header, channel: Channel):number {
    let lineLength:Array<number> = [];
    let lines:Array<Uint8Array> = [];
    let height = header.bottom - header.top;
    let width = header.right - header.left;
    for(let i =0; i < height; i++) {
      let line = StreamWriter.createPackbits(channel.data.slice(i*width,i*width+width)) as Uint8Array;
      lines.push(line);
      lineLength.push(line.length);
    }

    let ipDataStart = stream.tell();

    for(let i = 0; i < lineLength.length; i++) {
      stream.writeUint16(lineLength[i]);
    }
    for(let i = 0; i < lines.length;i++) {
      stream.write(lines[i]);
    }
    let ipDataEnd = stream.tell();
    return ipDataEnd - ipDataStart;
  }

  getCanvas() {
    let canvas:HTMLCanvasElement = document.createElement('canvas');
    let ctx:CanvasRenderingContext2D|null = canvas.getContext('2d');
    let width:number = canvas.width = (this.header.right !== undefined && this.header.left !== undefined) ? (this.header.right - this.header.left) : 0;
    let height:number = canvas.height = (this.header.bottom !== undefined && this.header.top !== undefined) ? (this.header.bottom - this.header.top) : 0;
    let imageData:ImageData|null = null;
    let pixelArray:Uint8ClampedArray|null = null;

    if (width <= 0 || height <= 0) {
      return null;
    }

    if(ctx) imageData = ctx.createImageData(width, height);
    if(imageData) pixelArray = imageData.data;

    let channelR = this.channels[0] as Channel;
    let channelG = this.channels[1] as Channel;
    let channelB = this.channels[2] as Channel;
    let channelA:null|Channel = null;
    //where is the alpha channel? what is a sheet mask?
    //sometimes the alpha is @this.channels.length - 3, sometimes the alpha channel is @this.channels.length - 1
    if(!this.channels[this.channels.length - 3].skip) channelA = this.channels[this.channels.length - 3] as Channel;
    if(!this.channels[this.channels.length - 1].skip) channelA = this.channels[this.channels.length - 1] as Channel;

    if(channelR && channelG && channelB && channelA && channelR.data && channelG.data && channelB.data && channelA.data && pixelArray) {
      for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
          let index = (y * width + x);
          pixelArray[index * 4] = channelR.data[index];
          pixelArray[index * 4 + 1] = channelG.data[index];
          pixelArray[index * 4 + 2] = channelB.data[index];
          pixelArray[index * 4 + 3] = channelA.data[index];
        }
      }
    } else
    if(channelR && channelG && channelB && channelR.data && channelG.data && channelB.data && pixelArray) {
      for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
          let index = (y * width + x);
          pixelArray[index * 4] = channelR.data[index];
          pixelArray[index * 4 + 1] = channelG.data[index];
          pixelArray[index * 4 + 2] = channelB.data[index];
          pixelArray[index * 4 + 3] = 255;
        }
      }
    } else
    if(channelR && channelR.data && this.colorTable && pixelArray) {
      //indexed color
      for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
          let index = (y * width + x);
          pixelArray[index * 4] = this.colorTable[channelR.data[index]*3];
          pixelArray[index * 4 + 1] = this.colorTable[channelR.data[index]*3+1];
          pixelArray[index * 4 + 2] = this.colorTable[channelR.data[index]*3+2];
          pixelArray[index * 4 + 3] = 255;
        }
      }
    } else
    if(channelR && channelR.data && pixelArray) {
      for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
          let index = (y * width + x);
          pixelArray[index * 4] = 0;
          pixelArray[index * 4 + 1] = 0;
          pixelArray[index * 4 + 2] = 0;
          pixelArray[index * 4 + 3] = channelR.data[index];
        }
      }
    } else
    if(channelA && channelA.data && pixelArray) {
      for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
          let index = (y * width + x);
          pixelArray[index * 4] = 0;
          pixelArray[index * 4 + 1] = 0;
          pixelArray[index * 4 + 2] = 0;
          pixelArray[index * 4 + 3] = channelA.data[index];
        }
      }
    }

    ctx && imageData && ctx.putImageData(imageData, 0, 0);
    return canvas;
  };

  /**
   * Sets the VirtualMemoryArray from HTMLCanvasElement pixel data.
   * @param {HTMLCanvasElement} canvas
   * @returns {null}
   */
  setCanvas(canvas : HTMLCanvasElement) {
    let ctx:CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    let width:number = canvas.width;
    let height:number = canvas.height;

    if (width <= 0 || height <= 0) {
      return null;
    }

    this.header = {
      length : 42,
      channels : 24,
      version : 3,
      left : 0,
      right : width,
      top : 0,
      bottom : height,
    };

    this.channels = [];
    for(let i = 0; i < 3; i++) {
      this.channels.push({
        skip : false,
        length : 42,
        depth1 : 8,
        top : 0,
        left: 0,
        bottom: height,
        right: width,
        depth2:8,
        compressionMode:CompressionMethod.RLE,
        data:new Uint8Array(width*height)
      })
    }
    //empty channels
    for(let i = 3; i < 25;i++) {
      this.channels.push({
        skip : true
      });
    }
    //user mask
    this.channels.push({
      skip : false,
      length : 42,
      depth1 : 8,
      top : 0,
      left: 0,
      bottom: height,
      right: width,
      depth2:8,
      compressionMode:CompressionMethod.RLE,
      data:new Uint8Array(width*height)
    });

    let imageData = ctx.getImageData(0,0,width,height);
    let pixelArray = imageData.data;

    const channelR = this.channels[0] as Channel;
    const channelG = this.channels[1] as Channel;
    const channelB = this.channels[2] as Channel;
    const channelA = this.channels[25] as Channel;

    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        let index = (y * width + x);
        (channelR.data)[index] = pixelArray[index * 4];
        (channelG.data)[index] = pixelArray[index * 4 + 1];
        (channelB.data)[index] = pixelArray[index * 4 + 2];
        (channelA.data)[index] = pixelArray[index * 4 + 3];
      }
    }
  }

  write(stream:StreamWriter) {
    //  Number of channels + one for user mask + one for sheet mask.
    //  Make sure you loop number of channels + 2. Make sure you are skipping non written and no length arrays.
    let lengthVMA = 0;
    stream.writeInt32(this.header.version);
    const ipLengthVMA = stream.tell();
    stream.writeInt32(this.header.length);
    const ipDataStart = stream.tell();
    stream.writeInt32(this.header.top);
    stream.writeInt32(this.header.left);
    stream.writeInt32(this.header.bottom);
    stream.writeInt32(this.header.right);
    stream.writeInt32(this.header.channels);
    for(let i = 0; i < this.header.channels + 2; i++) {
      let channel = this.channels[i] as Channel;
      if(channel.skip) {
        stream.writeInt32(0); //skip channel
        continue;
      }
      stream.writeInt32(1); //do not skip channel, data present
      const ipLengthChannel = stream.tell();
      stream.writeInt32(channel.length);
      const ipDataStart = stream.tell();
      stream.writeInt32(channel.depth1);
      stream.writeInt32(channel.top);
      stream.writeInt32(channel.left);
      stream.writeInt32(channel.bottom);
      stream.writeInt32(channel.right);
      stream.writeInt16(channel.depth2);
      stream.writeInt8(channel.compressionMode);
      switch (channel.compressionMode) {
        case CompressionMethod.RAW:
          stream.write(channel.data);
          break;
        case CompressionMethod.RLE:
          VirtualMemoryArray.writeChannelRLE(stream, this.header, channel);
          break;
        default:
          throw new Error('unsupported compression method');
      }
      const ipDataEnd = stream.tell();

      //write pattern length field.
      const ipNow = stream.tell();
      stream.seek(ipLengthChannel, 0);
      stream.writeUint32(ipDataEnd - ipDataStart);
      stream.seek(ipNow, 0);
    }
    const ipDataEnd = stream.tell();

    //write vma length field.
    const ipNow = stream.tell();
    stream.seek(ipLengthVMA, 0);
    stream.writeUint32(ipDataEnd - ipDataStart);
    stream.seek(ipNow, 0);
  }
}