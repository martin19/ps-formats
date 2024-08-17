
import {ImageResourceBlock} from "./ImageResourceBlock";
import {StreamReader} from "./StreamReader";
import {StreamWriter} from "./StreamWriter";
export class ImageResources {

  private _offset:number = 0;
  private _length:number = 0;

  imageResourceBlocks:ImageResourceBlock[]|null = null;

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader) {
    let length:number;

    this.imageResourceBlocks = [];
    this._offset = stream.tell();
    length = stream.readUint32();
    this._length = length + 4;

    while(length > 0) {
      let offset = stream.tell();
      let imageResourceBlock = new ImageResourceBlock();
      imageResourceBlock.parse(stream);
      this.imageResourceBlocks.push(imageResourceBlock);
      length -= stream.tell() - offset;
    }
    stream.seek(this._offset + this._length, 0);
  }
  
  write(stream:StreamWriter) {
    if(!this.imageResourceBlocks) {
      stream.writeUint32(0);
      return;
    }
    const length = this.imageResourceBlocks.map(irb => irb.getLength()).reduce((a, b) => { return a + b; }, 0);
    stream.writeUint32(length);
    this.imageResourceBlocks.forEach(irb => {
      irb.write(stream);
    });
  }
}