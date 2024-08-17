import {IAdditionalLayerInfoBlock} from "./AdditionalLayerInfoParser";
import {StreamReader} from "../StreamReader";
import {Header} from "../Header";
import {Descriptor} from "../Descriptor";
import {StreamWriter} from "../StreamWriter";
import {ISmartObjectPlacementData} from "../../../Effects/GLTypes";
import {DescriptorUtils} from "../DescriptorUtils";
import {Objc} from "../Descriptor/Objc";
export class SoLd implements IAdditionalLayerInfoBlock {

  private _offset:number = 0;
  private _length:number = 0;

  identifier:string = "";
  version:number = 0;
  descriptorVersion:number = 0;
  descriptor:Descriptor = new Descriptor();
  settings: ISmartObjectPlacementData = {};

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._length;
  }

  parse(stream:StreamReader, length?:number, header?:Header) {
    this._offset = stream.tell();

    this.identifier = stream.readString(4);
    if (this.identifier !== 'soLD') {
      throw new Error('invalid identifier:' + this.identifier);
    }

    this.version = stream.readUint32();
    this.descriptorVersion = stream.readInt32();
    this.descriptor = new Descriptor();
    this.descriptor.parse(stream);

    this.settings = {};
    this.descriptor.item.forEach(di => {
        if(di.key === "Idnt") this.settings.idnt = DescriptorUtils.getText(di);
        else if(di.key === "placed") this.settings.placed = DescriptorUtils.getText(di);
        else if(di.key === "PgNm") this.settings.page = DescriptorUtils.getLong(di);
        else if(di.key === "totalPages") this.settings.totalPages = DescriptorUtils.getLong(di);
        else if(di.key === "frameStep") {
          const desc = (di.data as Objc).value;
          let numerator = desc.item.find(value => value.key === "numerator");
          let denominator = desc.item.find(value => value.key === "denominator");
          this.settings.frameStep = {};
          if(numerator) this.settings.frameStep.numerator = DescriptorUtils.getLong(numerator);
          if(denominator) this.settings.frameStep.denominator = DescriptorUtils.getLong(denominator);
        }
        else if(di.key === "duration") {
          const desc = (di.data as Objc).value;
          let numerator = desc.item.find(value => value.key === "numerator");
          let denominator = desc.item.find(value => value.key === "denominator");
          this.settings.duration = {};
          if(numerator) this.settings.duration.numerator = DescriptorUtils.getLong(numerator);
          if(denominator) this.settings.duration.denominator = DescriptorUtils.getLong(denominator);
        }
        else if(di.key === "frameCount") this.settings.frameCount = DescriptorUtils.getLong(di);
        else if(di.key === "Annt") this.settings.annt = DescriptorUtils.getLong(di);
        else if(di.key === "Type") this.settings.type = DescriptorUtils.getLong(di);
        else if(di.key === "Trnf") this.settings.transform = DescriptorUtils.getVlLs(di) as number[];
        else if(di.key === "warp") this.settings.warp = DescriptorUtils.getWarpData((di.data as Objc).value);
        else if(di.key === "nonAffineTransform") this.settings.nonAffineTransform = DescriptorUtils.getVlLs(di) as number[];
        else if(di.key === "Sz  ") this.settings.size = DescriptorUtils.getPnt(di);
        else if(di.key === "Rslt") this.settings.rslt = DescriptorUtils.getUntf(di);
    })


    this._length = stream.tell() - this._offset;
  }


  write(stream:StreamWriter):void {
    stream.writeString("soLD");
    stream.writeUint32(4);
    stream.writeUint32(16);
    this.descriptor.write(stream);
  }

}