import {createElement} from "../../shared/utils/create-element";

interface Options {
  duration?: number;
  type?: 'success' | 'error';
}

export default class NotificationMessage {
  private static element: HTMLElement;

  constructor(private message: string, private options: Options = {
    duration: 2000,
    type: 'success',
  }) {
    if (NotificationMessage.element) {
      this.remove();
    }
    NotificationMessage.element = this.makeNotificationTemplate();
  }

  public get element() {
    return NotificationMessage.element
  }

  public show(target: HTMLElement | undefined) {
    target ? target.append(NotificationMessage.element) : document.body.append(NotificationMessage.element);
    setTimeout(this.remove, this.options.duration);
  }

  public remove() {
    NotificationMessage.element.remove();
  }

  public destroy() {
    NotificationMessage.element.remove();
  }

  private makeNotificationTemplate() {
    const duration = typeof this.options?.duration === 'number'
      ? this.options?.duration + 'ms'
      : this.options?.duration
    ;
    return createElement(`
      <div class="notification ${this.options?.type}" style="--value:${duration}">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.options?.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>
    `);
  }
}
