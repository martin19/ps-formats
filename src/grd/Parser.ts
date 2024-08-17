import {registerDescriptorInfoBlocks} from "../../psd/Descriptor/DescriptorsInfoBlocks";
import {StreamReader} from "../../psd/StreamReader";
import {Descriptor, DescriptorItemType} from "../../psd/Descriptor";
import {DescriptorInfoBlockFactory} from "../../psd/Descriptor/DescriptorInfoBlock";
import {Objc} from "../../psd/Descriptor/Objc";
import {TEXT} from "../../psd/Descriptor/TEXT";
import {VirtualMemoryArray} from "../../psd/VirtualMemoryArray";
import {VlLs} from "../../psd/Descriptor/VlLs";
import {DescriptorUtils} from "../../psd/DescriptorUtils";
import {IGradientDef} from "../../common/src/PSTypes";

export interface ParserOptions {
  inputPosition?: number;
}


/**
 * GRD parser
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
    let gradients:IGradientDef[] = [];
    const stream = this.stream;
    if (stream.readString(4) !== '8BGR') {
      throw new Error('invalid signature');
    }
    const version = stream.readUint16(); //5
    const skip = stream.read(26);
    let key = stream.readString(4);
    let type = stream.readString(4);
    let vlls = new VlLs();
    vlls.parse(stream);
    vlls.item.forEach(item => {
      gradients.push(DescriptorUtils.getGradient((item.data as Objc).value.item[0]));
    });
    return gradients;
  }
}