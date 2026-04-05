import {createElement} from "../../shared/utils/create-element";

export default class Tooltip {
  private static tooltip: HTMLElement | null = null;

  constructor() {
    if (!Tooltip.tooltip) {
      Tooltip.tooltip = this.makeTooltipTemplate();
    }
  }

  public get element() {
    if (!Tooltip.tooltip) {
      Tooltip.tooltip = this.makeTooltipTemplate();
    }

    return Tooltip.tooltip;
  }

  public render(html: string | null) {
    this.element.textContent = html;
    document.appendChild(this.element);
  }

  public initialize() {
    document.addEventListener('pointerover', (event) => {
      const tooltipTarget = event.target as HTMLElement;
      if (tooltipTarget.dataset.tooltip) {
        this.element.textContent = tooltipTarget.dataset.tooltip;
        tooltipTarget.appendChild(this.element);
      }
    });
    document.addEventListener('pointerout', (event) => {
      this.destroy();

      // const tooltipTarget = event.target as HTMLElement;
      // if (tooltipTarget.dataset.tooltip) {
      //   this.tooltip.textContent = tooltipTarget.dataset.tooltip;
      // }
    });
  }

  public destroy() {
    this.element.remove();
  }

  private makeTooltipTemplate() {
    return createElement('<div class="tooltip"></div>');
  }
}
