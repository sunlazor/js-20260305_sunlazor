import {createElement} from "../../shared/utils/create-element";

type DoubleSliderSelected = {
  from: number;
  to: number;
};

type FormatValue = (value: number) => string;

interface Options {
  min?: number;
  max?: number;
  formatValue?: FormatValue;
  selected?: DoubleSliderSelected;
}

export default class DoubleSlider {
  public min: number;
  public max: number;
  public element: HTMLElement;

  private formatValue: FormatValue;
  private selected: DoubleSliderSelected;

  constructor(sliderConf: Options = {}) {
    this.min = sliderConf?.min || 0;
    this.max = sliderConf?.max || Number.MAX_SAFE_INTEGER;
    this.formatValue = sliderConf?.formatValue ?? function(value: number) { return value.toString() };
    this.selected = sliderConf?.selected ?? { from: this.max * 0.25, to: this.max * 0.75};

    this.element = this.makeSliderTemplate();
  }

  public destroy() {

  }

  private makeSliderTemplate() {
    const left = (this.selected.from - this.min) / (this.max - this.min) * 100;
    const right = 100 - (this.selected.to - this.min) / (this.max - this.min) * 100;

    return createElement(`
        <div class="range-slider">
          <span>${this.formatValue(this.min)}</span>
          <div class="range-slider__inner">
            <span class="range-slider__progress" style="left: ${left}%; right: ${right}%"></span>
            <span class="range-slider__thumb-left" style="left: ${left}%"></span>
            <span class="range-slider__thumb-right" style="right: ${right}%"></span>
          </div>
          <span>${this.formatValue(this.max)}</span>
        </div>
    `);
  }
}
