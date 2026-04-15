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
  private readonly sliderBar: HTMLSpanElement;

  constructor(sliderConf: Options = {}) {
    this.min = sliderConf?.min || 0;
    this.max = sliderConf?.max || this.min + 100;
    this.formatValue = sliderConf?.formatValue ?? function(value: number) { return value.toString() };
    this.selected = sliderConf?.selected ?? { from: this.max * 0.25, to: this.max * 0.75};

    this.element = this.makeSliderTemplate();
    this.sliderBar = <HTMLSpanElement>this.element.querySelector('.range-slider__progress');
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
        this.addLeftThumbEvents(thumb, this.sliderBar);
      } else if (thumb.classList.contains('range-slider__thumb-right')) {
        this.addRightThumbEvents(thumb, this.sliderBar);
      }
    }

    this.element.addEventListener('pointerdown', this.pointerdownEvent);
  }

  private addRightThumbEvents(rightThumb: HTMLElement, sliderBar: HTMLSpanElement) {
    const sliderLeft= this.innerSlider.getBoundingClientRect().left;
    const leftLimit = this.leftThumb.offsetLeft + this.leftThumb.getBoundingClientRect().width;
    const sliderWidth = this.innerSlider.getBoundingClientRect().width;
    const leftPercent = 100 * leftLimit / sliderWidth;

    this.pointermoveEvent = (event: PointerEvent) => {
      const inSliderCord = event.clientX - sliderLeft;
      const positionPercent = 100 * inSliderCord / sliderWidth;
      if (inSliderCord < leftLimit) {
        rightThumb.style.left = leftPercent + '%';
        sliderBar.style.right = 100 - leftPercent + '%';
      } else if (inSliderCord > sliderWidth) {
        rightThumb.style.left = 100 + '%';
        sliderBar.style.right = 0 + '%';
      } else {
        rightThumb.style.left = positionPercent + '%';
        sliderBar.style.right = 100 - positionPercent + '%';
      }
    };

    document.addEventListener('pointermove', this.pointermoveEvent);

    this.addThumbsPointerListeners();
  }

  private addLeftThumbEvents(leftThumb: HTMLElement, sliderBar: HTMLSpanElement) {
    const sliderLeft= this.innerSlider.getBoundingClientRect().left;
    const rightLimit = this.rightThumb.offsetLeft;
    const sliderWidth = this.innerSlider.getBoundingClientRect().width;
    const rightPercent = 100 * rightLimit / sliderWidth;

    this.pointermoveEvent = (event: PointerEvent) => {
      const inSliderCord = event.clientX - sliderLeft;
      const positionPercent = 100 * inSliderCord / sliderWidth;
      if (inSliderCord < 0) {
        leftThumb.style.left = '0%';
        sliderBar.style.left = '0%';
      } else if (inSliderCord > rightLimit) {
        leftThumb.style.left = rightPercent + '%';
        sliderBar.style.left = rightPercent + '%';
      } else {
        leftThumb.style.left = positionPercent + '%';
        sliderBar.style.left = positionPercent + '%';
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
