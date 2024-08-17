import {registerDescriptorInfoBlocks} from "../../psd/Descriptor/DescriptorsInfoBlocks";
import {StreamReader} from "../../psd/StreamReader";
import {Descriptor, DescriptorItemType} from "../../psd/Descriptor";
import {DescriptorInfoBlockFactory} from "../../psd/Descriptor/DescriptorInfoBlock";
import {Objc} from "../../psd/Descriptor/Objc";
import {TEXT} from "../../psd/Descriptor/TEXT";
import {VirtualMemoryArray} from "../../psd/VirtualMemoryArray";
import {DescriptorUtils} from "../../psd/DescriptorUtils";
import {lfx2} from "../../psd/AdditionalLayerInfo/lfx2";
import {ColorMode} from "../../psd/EnumColorMode";
import {ILayerBlendConfig, IStyleDef} from "../../common/src/PSTypes";

export interface ParserOptions {
  inputPosition?: number;
}


/**
 * ASL parser
 * @param input input buffer.
 * @param opt_param option parameters.
 */
export class Parser {

  stream : StreamReader;

  constructor(input:Uint8Array, opt_param?:ParserOptions) {
    registerDescriptorInfoBlocks();

    if (!opt_param) {
      opt_param = {};
    }

    this.stream = new StreamReader(input, typeof opt_param.inputPosition === "undefined" ? 0 : opt_param.inputPosition);
  }

  parse() {
    let patterns:VirtualMemoryArray[] = [];
    let blendModes:ILayerBlendConfig[] = [];

    let styles:IStyleDef[] = [];

    let finished = false;
    const stream = this.stream;
    const tag = stream.readUint16();
    if (stream.readString(4) !== '8BSL') {
      throw new Error('invalid signature');
    }
    const version = stream.readUint16(); //3

    const len = stream.readUint32(); //0 - probably means next block is a count field
    if(len !== 0) {
      let patternsLength = len;
      const patternsStart = stream.tell();
      do {
        const patternLength = stream.readUint32();
        // if(patternLength === 0) break;
        const patternStart = stream.tell();
        var pattern = new VirtualMemoryArray();
        pattern.version = stream.readUint32();
        pattern.mode = stream.readUint32();
        pattern.horizontal = stream.readUint16();
        pattern.vertical = stream.readUint16();
        var strLen = stream.readUint32();
        pattern.name = stream.readWideString(strLen);
        pattern.id = stream.readPascalString().substring(0,36);
        if (pattern.mode === ColorMode.INDEXED_COLOR) {
          pattern.colorTable = stream.read(256 * 3);
          let dummy = stream.readUint32();
        }
        pattern.parse(stream);
        patterns.push(pattern);
        while(stream.tell() % 4 !== 0) {
          stream.read(1);
        }
      } while(stream.tell()-patternsStart < patternsLength)
    }

    while(stream.tell() % 4 !== 0) {
      stream.read(1);
    }

    const stylesCount = stream.readUint32();

    for(let i = 0; i < stylesCount; i++) {
      let style:IStyleDef = { uuid : "", name : "", config : {} };

      const styleLength = stream.readUint32();
      const limit = stream.tell() + styleLength;
      const skip = stream.read(26);

      let key = stream.readString(4); //Nm..
      let type = stream.readString(4); //TEXT
      let nameValue = new TEXT();
      nameValue.parse(stream);
      style.name = nameValue.string;

      const len = stream.readUint32();
      key = stream.readString(4); //Idnt
      type = stream.readString(4); //TEXT
      let idntValue = new TEXT();
      idntValue.parse(stream);
      style.uuid = idntValue.string;

      let padding = stream.read(14);

      let styl = stream.readString(4);
      let stylVersion = stream.readUint32(); //2
      let documentModeLen = stream.readUint32();
      let documentMode = stream.readString(documentModeLen);
      type = stream.readString(4); //Objc
      let documentModeValue = new Objc();
      documentModeValue.parse(stream);

      let zero = stream.readUint32();

      key = stream.readString(4); //optional Lefx
      if(key === "Lefx") {
        let type = stream.readString(4); //Objc
        let lefxValue = new Objc;
        lefxValue.parse(stream);
        style.config = DescriptorUtils.getLfx2(lefxValue.value);
      } else {
        stream.seek(-6);
      }

      if(stream.tell() < limit-4) {
        //blend mode is optional
        const optionalLen = stream.readUint32();
        let blendOptions = stream.readString(optionalLen);
        let blendModeType = stream.readString(4);
        let blendModeValue = new Objc();
        blendModeValue.parse(stream);
        blendModes.push(blendModeValue as any);
      }

      while(stream.tell() % 4 !== 0) {
        stream.read(1);
      }

      styles.push(style);
    }

    //TODO: blendmodes
    // console.log(JSON.stringify(blendModes));
    // throw new Error("patterns and blendmodes parsing not implemented.");

    return { styles, patterns };
  }
}