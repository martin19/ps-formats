import {StreamReader} from "./StreamReader";
import {Header} from "./Header";
import {ColorModeData} from "./ColorModeData";
import {ImageResources} from "./ImageResources";
import {LayerAndMaskInformation} from "./LayerAndMaskInformation";
import {PSDImageData} from "./ImageData";
import {registerDescriptorInfoBlocks} from "./Descriptor/DescriptorsInfoBlocks";

export interface ParserOptions {
  inputPosition?: number;
}

/**
 * PSD parser in JavaScript.
 * @author imaya <imaya.devel@gmail.com>
 */
export class Parser {

  stream : StreamReader;
  header:Header;
  colorModeData:ColorModeData;
  imageResources:ImageResources;
  layerAndMaskInformation:LayerAndMaskInformation;
  imageData:PSDImageData;


  /**
   * PSD parser
   * @param input input buffer.
   * @param opt_param option parameters.
   */
  constructor(input:Uint8Array, opt_param?:ParserOptions) {
    registerDescriptorInfoBlocks();

    if (!opt_param) {
      opt_param = {};
    }

    this.stream = new StreamReader(input, typeof opt_param.inputPosition === "number" ? opt_param.inputPosition : 0);

    // initialize
    this.header = new Header();
    this.colorModeData = new ColorModeData();
    this.imageResources = new ImageResources();
    this.layerAndMaskInformation = new LayerAndMaskInformation();
    this.imageData = new PSDImageData();
  }

  parse() {
    var stream = this.stream;

    // parse
    this.header.parse(stream);
    this.colorModeData.parse(stream, this.header);
    this.imageResources.parse(stream);
    this.layerAndMaskInformation.parse(stream, this.header);
    this.imageData.parse(stream, this.header);
  }

}