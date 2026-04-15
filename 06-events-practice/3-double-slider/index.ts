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

  private readonly formatValue: FormatValue;
  private selected: DoubleSliderSelected;
  private pointermoveEvent: ((event: PointerEvent) => void) | null = null;
  private pointerdownEvent: ((event: PointerEvent) => void) | null = null;
  private pointerupEvent: (() => void) | null = null;
  private readonly leftThumb: HTMLSpanElement;
  private readonly rightThumb: HTMLSpanElement;
  private readonly innerSlider: HTMLDivElement;

  constructor(sliderConf: Options = {}) {
    this.min = sliderConf?.min || 0;
    this.max = sliderConf?.max || this.min + 100;
    this.formatValue = sliderConf?.formatValue ?? function(value: number) { return value.toString() };
    this.selected = sliderConf?.selected ?? { from: this.max * 0.25, to: this.max * 0.75};

    this.element = this.makeSliderTemplate();
    this.leftThumb = <HTMLSpanElement>this.element.querySelector('.range-slider__thumb-left');
    this.rightThumb = <HTMLSpanElement>this.element.querySelector('.range-slider__thumb-right');
    this.innerSlider = <HTMLDivElement>this.element.querySelector('.range-slider__inner');

    this.addThumbEvents();
  }

  public destroy() {
    this.pointerdownEvent = null;
    this.pointermoveEvent = null;
    this.pointerupEvent = null;
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

  private addThumbEvents() {
    this.pointerdownEvent = (event: PointerEvent) => {
      const thumb = event.target as HTMLElement;
      if (thumb.classList.contains('range-slider__thumb-left')) {
        this.addLeftThumbEvents(thumb);
      } else if (thumb.classList.contains('range-slider__thumb-right')) {
        this.addRightThumbEvents(thumb);
      }
    }

    this.element.addEventListener('pointerdown', this.pointerdownEvent);
  }

  private addRightThumbEvents(rightThumb: HTMLElement) {
    const sliderLeft= this.innerSlider.getBoundingClientRect().left;
    const leftLimit = this.leftThumb.offsetLeft + this.leftThumb.getBoundingClientRect().width;
    const rightLimit = this.innerSlider.getBoundingClientRect().width;

    this.pointermoveEvent = (event: PointerEvent) => {
      const inSliderCord = event.clientX - sliderLeft;
      if (inSliderCord < leftLimit) {
        rightThumb.style.left = leftLimit + 'px';
      } else if (inSliderCord > rightLimit) {
        rightThumb.style.left = rightLimit + 'px';
      } else {
        rightThumb.style.left = inSliderCord + 'px';
      }
    };

    document.addEventListener('pointermove', this.pointermoveEvent);

    this.addThumbsPointerListeners();
  }

  private addLeftThumbEvents(leftThumb: HTMLElement) {
    const sliderLeft= this.innerSlider.getBoundingClientRect().left;
    const rightLimit = this.rightThumb.offsetLeft;

    this.pointermoveEvent = (event: PointerEvent) => {
      const inSliderCord = event.clientX - sliderLeft;
      if (inSliderCord < 0) {
        leftThumb.style.left = '0px';
      } else if (inSliderCord > rightLimit) {
        leftThumb.style.left = rightLimit + 'px';
      } else {
        leftThumb.style.left = inSliderCord + 'px';
      }
    };

    document.addEventListener('pointermove', this.pointermoveEvent);

    this.addThumbsPointerListeners();
  }

  private addThumbsPointerListeners() {
    this.pointerupEvent = () => {
      if (this.pointerdownEvent) {
        document.removeEventListener('pointerdown', this.pointerdownEvent);
      }
      if (this.pointermoveEvent) {
        document.removeEventListener('pointermove', this.pointermoveEvent);
      }
      if (this.pointerupEvent) {
        document.removeEventListener('pointerup', this.pointerupEvent);
      }
    };

    document.addEventListener('pointerup', this.pointerupEvent);
  }
}
