import {createElement} from "../../shared/utils/create-element";

interface Options {
  // массив чисел (данные графика)
  data?: number[];
  // заголовок (например, "orders")
  label?: string;
  // основное числовое значение (например, "344")
  value?: number;
  // ссылка "View all" (если передана)
  link?: string;
  // функция для форматирования значения value (например, добавление знака валюты $)
  formatHeading?: (data: number) => string;
}

export default class ColumnChart {
  // Ссылка на корневой DOM-элемент компонента (HTMLElement).
  element;
  // Фиксированная высота графика (должна быть равна 50).
  chartHeight = 50;

  private chartDiv: HTMLElement | null = null;

  constructor(private columnChart: Options = {
    data: [],
    label: '',
    link: '',
    value: 0,
    formatHeading: (data: number) => data.toString(),
  }) {
    this.element = this.makeChartTemplate();
    this.update(this.columnChart?.data);
  }

  // Принимает новый массив данных и обновляет только тело графика (столбцы), не перерисовывая весь компонент целиком.
  update(data: number[] | undefined) {
    if (!this.chartDiv) {
      this.chartDiv = this.element.querySelector<HTMLElement>('div[data-element="body"]');
      if (!this.chartDiv) {
        throw new Error('Could not find column chart');
      }
    }

    if (!data || data.length === 0) {
      this.chartDiv.innerHTML = '';
      this.element.classList.toggle('column-chart_loading', true);
    } else {
      const maxValue = Math.max(...data);
      const scale = this.chartHeight / maxValue;
      const dataHtml = data.map(
        (dataValue) => `<div style="&#45;&#45;value: ${Math.floor(dataValue * scale)}" data-tooltip="${(dataValue / maxValue * 100).toFixed(0)}%"></div>`
      ).join('');
      if (dataHtml) {
        this.chartDiv.innerHTML = dataHtml;
      }
    }
  }

  // Удаляет элемент компонента из DOM.
  remove() {
    this.element.remove();
  }

  // Полностью удаляет компонент, очищает обработчики событий и ссылки на DOM-элементы (для предотвращения утечек памяти).
  destroy() {
    this.remove();
  }

  private makeChartTemplate() {
    const chartLinkHtml = this.columnChart?.link
      ? `<a href="${this.columnChart?.link}" class="column-chart__link">View all</a>`
      : '';

    let value;
    if (typeof this.columnChart?.value === 'number') {
      if (this.columnChart.formatHeading) {
        value = this.columnChart.formatHeading(this.columnChart.value);
      } else {
        value = this.columnChart.value;
      }
    }

    return createElement(`
    <div class="column-chart" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
<!--        Total orders-->
        ${this.columnChart?.label}
        ${chartLinkHtml}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${value}</div>
        <div data-element="body" class="column-chart__chart">
<!--          <div style="&#45;&#45;value: 2" data-tooltip="6%"></div>-->
<!--          <div style="&#45;&#45;value: 22" data-tooltip="44%"></div>-->
<!--          <div style="&#45;&#45;value: 5" data-tooltip="11%"></div>-->
        </div>
      </div>
    </div>
    `);
  }
}
