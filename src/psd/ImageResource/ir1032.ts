import {StreamReader} from "../StreamReader";
import {StreamWriter} from "../StreamWriter";

export interface GuideSettings {
  location : number;
  direction : "h"|"v";
}
export interface GridAndGuideSettings {
  gridCycleHoriz? : number;
  gridCycleVert? : number;
  guides? : GuideSettings[];
  guidesLocked? : boolean;
}

export class ir1032 {

  gridAndGuideSettings? : GridAndGuideSettings;

  parse(stream:StreamReader) {
    this.gridAndGuideSettings = { guides : [] };
    const offset = stream.tell();
    const version = stream.readUint32();
    if(version !== 1) return;
    this.gridAndGuideSettings.gridCycleHoriz = stream.readUint32();
    this.gridAndGuideSettings.gridCycleVert = stream.readUint32();
    const guideCount = stream.readUint32();
    if(guideCount > 0) {
      this.gridAndGuideSettings.guides = [];
      for(let i = 0; i < guideCount; i++) {
        const location = stream.readInt32();
        const direction = stream.readUint8() === 0 ? "v" : "h";
        this.gridAndGuideSettings.guides.push({ location, direction });
      }
    }
  }

  write(stream:StreamWriter):void {
    if(!this.gridAndGuideSettings) return;
    stream.writeUint32(1);
    stream.writeUint32(this.gridAndGuideSettings.gridCycleHoriz ?? 0);
    stream.writeUint32(this.gridAndGuideSettings.gridCycleVert ?? 0);
    if(!this.gridAndGuideSettings.guides || this.gridAndGuideSettings.guides.length === 0) {
      stream.writeUint32(0);
    } else {
      stream.writeUint32(this.gridAndGuideSettings.guides.length);
      for (let guide of this.gridAndGuideSettings.guides) {
        stream.writeInt32(guide.location);
        stream.writeUint8(guide.direction === "v" ? 0 : 1);
      }
    }
  }

  getLength():number {
    if(!this.gridAndGuideSettings) return 0;
    return 4 + 4 + 4 + 4 + (this.gridAndGuideSettings.guides?.length ?? 0) * 5;
  }
}
