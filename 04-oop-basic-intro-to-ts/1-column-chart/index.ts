import { createElement } from "../../shared/utils/create-element";

interface Options {
  // массив чисел (данные графика)
  data: number[];
  // заголовок (например, "orders")
  label: string;
  // основное числовое значение (например, "344")
  value: number;
  // ссылка "View all" (если передана)
  link: string;
  // функция для форматирования значения value (например, добавление знака валюты $)
  formatHeading: Function;
}

export default class ColumnChart {
  constructor({ }: Options = {}) {

  }
}
