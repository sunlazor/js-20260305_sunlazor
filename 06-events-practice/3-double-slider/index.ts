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
  private readonly valueMax: HTMLSpanElement;
  private readonly valueMin: HTMLSpanElement;
  private diff: number;

  constructor(sliderConf: Options = {}) {
    this.min = sliderConf?.min || 100;
    this.max = sliderConf?.max || this.min + 100;
    this.diff = this.max - this.min;
    this.formatValue = sliderConf?.formatValue ?? function(value: number) { return Math.round(value).toString() };
    this.selected = sliderConf?.selected ?? { from: this.min, to: this.max};

    this.element = this.makeSliderTemplate();
    this.sliderBar = <HTMLSpanElement>this.element.querySelector('.range-slider__progress');
    this.leftThumb = <HTMLSpanElement>this.element.querySelector('.range-slider__thumb-left');
    this.rightThumb = <HTMLSpanElement>this.element.querySelector('.range-slider__thumb-right');
    this.innerSlider = <HTMLDivElement>this.element.querySelector('.range-slider__inner');
    this.valueMax = <HTMLSpanElement>this.element.querySelector('span[data-element="to"]');
    this.valueMin = <HTMLSpanElement>this.element.querySelector('span[data-element="from"]');

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
          <span data-element="from">${this.formatValue(this.selected.from)}</span>
          <div class="range-slider__inner">
            <span class="range-slider__progress" style="left: ${left}%; right: ${right}%"></span>
            <span class="range-slider__thumb-left" style="left: ${left}%"></span>
            <span class="range-slider__thumb-right" style="right: ${right}%"></span>
          </div>
          <span data-element="to">${this.formatValue(this.selected.to)}</span>
        </div>
    `);
  }

  private addThumbEvents() {
    this.pointerdownEvent = (event: PointerEvent) => {
      const thumb = event.target as HTMLElement;
      if (thumb.classList.contains('range-slider__thumb-left')) {
        this.addLeftThumbEvents(this);
      } else if (thumb.classList.contains('range-slider__thumb-right')) {
        this.addRightThumbEvents(this);
      }
    }

    this.element.addEventListener('pointerdown', this.pointerdownEvent);
  }

  private addRightThumbEvents(doubleSlider: DoubleSlider) {
    const sliderLeft= this.innerSlider.getBoundingClientRect().left;
    const leftLimit = this.leftThumb.offsetLeft + this.leftThumb.getBoundingClientRect().width;
    const sliderWidth = this.innerSlider.getBoundingClientRect().width;
    const leftPercent = 100 * leftLimit / sliderWidth;

    this.pointermoveEvent = (event: PointerEvent) => {
      const inSliderCord = event.clientX - sliderLeft;
      const positionPercent = 100 * inSliderCord / sliderWidth;
      if (inSliderCord < leftLimit) {
        doubleSlider.rightThumb.style.left = leftPercent + '%';
        doubleSlider.sliderBar.style.right = 100 - leftPercent + '%';
        doubleSlider.valueMax.textContent = doubleSlider.formatValue(leftPercent / 100 * doubleSlider.diff + doubleSlider.min);
      } else if (inSliderCord > sliderWidth) {
        doubleSlider.rightThumb.style.left = 100 + '%';
        doubleSlider.sliderBar.style.right = 0 + '%';
        doubleSlider.valueMax.textContent = doubleSlider.formatValue(doubleSlider.max);
      } else {
        doubleSlider.rightThumb.style.left = positionPercent + '%';
        doubleSlider.sliderBar.style.right = 100 - positionPercent + '%';
        doubleSlider.valueMax.textContent = doubleSlider.formatValue(positionPercent / 100 * doubleSlider.diff + doubleSlider.min);
      }
    };

    document.addEventListener('pointermove', this.pointermoveEvent);

    this.addThumbsPointerListeners();
  }

  private addLeftThumbEvents(doubleSlider: DoubleSlider) {
    const sliderLeft= this.innerSlider.getBoundingClientRect().left;
    const rightLimit = this.rightThumb.offsetLeft;
    const sliderWidth = this.innerSlider.getBoundingClientRect().width;
    const rightPercent = 100 * rightLimit / sliderWidth;

    this.pointermoveEvent = (event: PointerEvent) => {
      const inSliderCord = event.clientX - sliderLeft;
      const positionPercent = 100 * inSliderCord / sliderWidth;
      if (inSliderCord < 0) {
        doubleSlider.leftThumb.style.left = '0%';
        doubleSlider.sliderBar.style.left = '0%';
        doubleSlider.valueMin.textContent = doubleSlider.formatValue(doubleSlider.min);
      } else if (inSliderCord > rightLimit) {
        doubleSlider.leftThumb.style.left = rightPercent + '%';
        doubleSlider.sliderBar.style.left = rightPercent + '%';
        doubleSlider.valueMin.textContent = doubleSlider.formatValue(rightPercent / 100 * doubleSlider.diff + doubleSlider.min);
      } else {
        doubleSlider.leftThumb.style.left = positionPercent + '%';
        doubleSlider.sliderBar.style.left = positionPercent + '%';
        doubleSlider.valueMin.textContent = doubleSlider.formatValue(positionPercent / 100 * doubleSlider.diff + doubleSlider.min);
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
      this.element.dispatchEvent(new CustomEvent('range-select', {
        bubbles: true,
        detail: {
          from: parseInt(this.valueMin.textContent),
          to: parseInt(this.valueMin.textContent),
        }
      }));
    };

    document.addEventListener('pointerup', this.pointerupEvent);
  }
}
