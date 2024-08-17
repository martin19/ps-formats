
import {StreamReader} from "./StreamReader";
import {StreamWriter} from "./StreamWriter";

export enum PathRecordType {
  CLOSED_SUBPATH_LENGTH = 0,
  CLOSED_SUBPATH_BEZIER_KNOT_LINKED = 1,
  CLOSED_SUBPATH_BEZIER_KNOT_UNLINKED = 2,
  OPEN_SUBPATH_LENGTH = 3,
  OPEN_SUBPATH_BEZIER_KNOT_LINKED = 4,
  OPEN_SUBPATH_BEZIER_KNOT_UNLINKED = 5,
  PATH_FILL_RULE = 6,
  CLIPBOARD = 7,
  INITIAL_FILL_RULE = 8
}

export enum PathRecordSubpathCombinationType {
  sameComponent = 65535,
  difference = 0,
  union = 1,
  subtract = 2,
  intersection = 3
}

export class PathRecord {

  type : PathRecordType = PathRecordType.CLOSED_SUBPATH_LENGTH;

  subPathLength:number = 0;

  //clipboard record
  top:number = 0;
  left:number = 0;
  bottom:number = 0;
  right:number = 0;
  resolution:number = 0;

  //subpath knot
  anchorX:number = 0;
  anchorY:number = 0;
  control1X:number = 0;
  control1Y:number = 0;
  control2X:number = 0;
  control2Y:number = 0;

  //path combination type
  subPathCombinationType : PathRecordSubpathCombinationType = PathRecordSubpathCombinationType.sameComponent;

  initialFillRule : number = 0;

  parse(stream:StreamReader) {
    let type:number;

    let offset = stream.tell();

    type = this.type = stream.readInt16();
    // Since the coordinates of Path is a fixed point of 8 to 24, should I divide by 1 << 24?
    switch (type) {
      // Subpath length records, selector value 0 or 3, contain the number of Bezier knot records in bytes 2 and 3.
      // The remaining 22 bytes are unused, and should be zeroes.
      case PathRecordType.CLOSED_SUBPATH_LENGTH:
      case PathRecordType.OPEN_SUBPATH_LENGTH:
        this.subPathLength = stream.readInt16();
        this.subPathCombinationType = stream.readUint16();
        stream.seek(20);
        break;
      case PathRecordType.CLOSED_SUBPATH_BEZIER_KNOT_LINKED:
      case PathRecordType.CLOSED_SUBPATH_BEZIER_KNOT_UNLINKED:
      case PathRecordType.OPEN_SUBPATH_BEZIER_KNOT_LINKED:
      case PathRecordType.OPEN_SUBPATH_BEZIER_KNOT_UNLINKED:
       this.control1Y = stream.readInt32() / 0x1000000;
       this.control1X = stream.readInt32() / 0x1000000;
       this.anchorY = stream.readInt32() / 0x1000000;
       this.anchorX = stream.readInt32() / 0x1000000;
       this.control2Y = stream.readInt32() / 0x1000000;
       this.control2X = stream.readInt32() / 0x1000000;
       break;
      case PathRecordType.PATH_FILL_RULE:
       stream.seek(24);
       break;
      case PathRecordType.CLIPBOARD:
       this.top = stream.readInt32() / 0x1000000;
       this.left = stream.readInt32() / 0x1000000;
       this.bottom = stream.readInt32() / 0x1000000;
       this.right = stream.readInt32() / 0x1000000;
       this.resolution = stream.readInt32() / 0x1000000;
       stream.seek(4);
      break;
      case PathRecordType.INITIAL_FILL_RULE:
        this.initialFillRule = stream.readInt16();
        stream.seek(22);
        break;
      default:
        console.warn('unknown path record type:', type);
        break;
     }

    stream.seek(26, offset);
  }

  write(stream:StreamWriter) {
    stream.writeInt16(this.type);
    switch (this.type) {
      case PathRecordType.CLOSED_SUBPATH_LENGTH:
      case PathRecordType.OPEN_SUBPATH_LENGTH:
        stream.writeInt16(this.subPathLength);
        stream.writeInt16(this.subPathCombinationType);
        for(let i = 0; i < 20; i++) stream.writeUint8(0);
        break;
      case PathRecordType.CLOSED_SUBPATH_BEZIER_KNOT_LINKED:
      case PathRecordType.CLOSED_SUBPATH_BEZIER_KNOT_UNLINKED:
      case PathRecordType.OPEN_SUBPATH_BEZIER_KNOT_LINKED:
      case PathRecordType.OPEN_SUBPATH_BEZIER_KNOT_UNLINKED:
         stream.writeInt32(this.control1Y * 0x1000000);
         stream.writeInt32(this.control1X * 0x1000000);
         stream.writeInt32(this.anchorY   * 0x1000000);
         stream.writeInt32(this.anchorX   * 0x1000000);
         stream.writeInt32(this.control2Y * 0x1000000);
         stream.writeInt32(this.control2X * 0x1000000);
        break;
      case PathRecordType.PATH_FILL_RULE:
        for(let i = 0; i < 24; i++) stream.writeUint8(0);
        break;
      case PathRecordType.CLIPBOARD:
        throw new Error("unsupported clipboard record");
      case PathRecordType.INITIAL_FILL_RULE:
        stream.writeInt16(this.initialFillRule);
        for(let i = 0; i < 22; i++) stream.writeUint8(0);
        break;
      default:
        console.warn('unknown path record type:', this.type);
        break;
    }
  }
}

