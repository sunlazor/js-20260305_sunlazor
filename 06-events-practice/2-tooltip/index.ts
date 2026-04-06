import {createElement} from "../../shared/utils/create-element";

export default class Tooltip {
  private static instance: Tooltip | null = null;
  public element: HTMLElement | null = null;

  constructor() {
    this.element = this.makeTooltipTemplate();

    if (!Tooltip.instance) {
      Tooltip.instance = this;
    }

    return Tooltip.instance;
  }

  public render(html: string) {
    if (this.element) {
      this.element.textContent = html;
      document.body.appendChild(this.element);
    }
  }

  public initialize() {
    document.addEventListener('pointerover', (event) => {
      const tooltipTarget = event.target as HTMLElement;
      if (tooltipTarget.dataset.tooltip && this.element) {
        this.element.textContent = tooltipTarget.dataset.tooltip;
        tooltipTarget.appendChild(this.element);
      }
    });
    document.addEventListener('pointerout', (event) => {
      this.destroy();
    });
  }

  public destroy() {
    this.element?.remove();
  }

  private makeTooltipTemplate() {
    return createElement('<div class="tooltip"></div>');
  }
}
