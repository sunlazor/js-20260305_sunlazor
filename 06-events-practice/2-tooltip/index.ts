export default class Tooltip {
  private tooltip: HTMLElement;

  constructor() {
    this.tooltip = this.makeTooltipTemplate();
  }

  public get element() {
    return this.tooltip;
  }

  private makeTooltipTemplate() {
    return document.createElement('<div class="tooltip"></div>');
  }
}
