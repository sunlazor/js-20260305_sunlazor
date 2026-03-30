import {createElement} from "../../shared/utils/create-element";

type SortOrder = 'asc' | 'desc';

type SortableTableData = Record<string, string | number>;

interface SortableTableHeader {
  id: string;
  title: string;
  sortable?: boolean;
  sortType?: 'string' | 'number';
  template?: (value: string | number) => string;
}

export default class SortableTable {
  public element: HTMLElement;
  constructor(private headersConfig: SortableTableHeader[] = [], private data: SortableTableData[] = []) {
    this.element = this.makeTableTemplate();
  }

  // sort(field, order): сортирует данные по колонке field в порядке asc/desc и перерисовывает тело таблицы.
  // Сортировка строк — через localeCompare (ru/en).
  // Сортировка чисел — через числовое сравнение.
  // Если колонка не найдена или не сортируемая — ничего не делаем.
  public sort(field: string, order: SortOrder = 'asc') {
    const fieldInHeader
      = this.headersConfig.filter((header) => header.id === field );
    const isFieldNotFound = fieldInHeader.length === 0;
    const isFieldNotSortable = fieldInHeader[0]?.sortable !== true;
    if (isFieldNotFound || isFieldNotSortable) {
      return;
    }

    this.changeColumnsDataOrder(field, order);

    const sortType = fieldInHeader[0]?.sortType ? fieldInHeader[0].sortType : null;
    if (sortType) {
      this.sortData(sortType, field, order);
    }

    this.rewriteBodyData();
  }

  private rewriteBodyData() {
    const bodyDiv
      = this.element?.querySelector<HTMLElement>('div[data-element="body"]');
    if (bodyDiv) {
      bodyDiv.innerHTML = '';
      this.makeTableBodyData(bodyDiv);
    }
  }

  private sortData(sortType: 'string' | 'number', field: string, order: SortOrder) {
    this.data.sort((a, b) => {
      if (sortType === 'string') {
        let compareResult = a[field].toString().localeCompare(
          b[field].toString(), ['ru', 'en'], {'caseFirst': 'upper', 'sensitivity': 'variant'}
        );
        const direction = order === 'asc' ? 1 : -1;

        return direction * compareResult;
      }

      if (sortType === 'number') {
        let compareResult =
          parseFloat(typeof a[field] === 'string' ? a[field] : a[field].toString())
          - parseFloat(typeof b[field] === 'string' ? b[field] : b[field].toString())
        ;
        const direction = order === 'asc' ? 1 : -1;

        return direction * compareResult;
      }

      return 0;
    });
  }

  private changeColumnsDataOrder(field: string, order: SortOrder) {
    const columnsCells
      = this.element?.querySelectorAll<HTMLElement>('div[data-element="header"] .sortable-table__cell') ?? [];
    if (columnsCells.length > 0) {
      columnsCells.forEach((columnCell: HTMLElement) => {
        if (columnCell.dataset.id !== field) {
          columnCell.dataset.order = '';
        } else {
          columnCell.dataset.order = `${order}`;
        }
      })
    }
  }

  private makeTableTemplate() {
    let table = createElement('<div class="sortable-table"></div>');
    table.appendChild(this.makeTableHeader());
    table.appendChild(this.makeTableBody());

    return table;
  }

  private makeTableHeader() {
    let tableRow = createElement(`
      <div data-element="header" class="sortable-table__header sortable-table__row">
      </div>
    `);

    this.headersConfig.forEach((column) => {
      let cell = createElement(`
        <div class="sortable-table__cell" data-id="${column.id}" data-sortable="${column?.sortable ? column.sortable : 'false'}">
          <span>${column.title}</span>
          ${column?.sortable ? '<span data-element="arrow" class="sortable-table__sort-arrow"><span class="sort-arrow"></span></span>' : ''}
        </div>
      `);

      tableRow.appendChild(cell);
    });

    return tableRow;
  }

  private makeTableBody() {
    let body = createElement(`
      <div data-element="body" class="sortable-table__body"></div>
    `);

    this.makeTableBodyData(body);

    return body;
  }

  private makeTableBodyData(body: HTMLElement) {
    this.data.forEach((row) => {
      let divRow = createElement(`<a class="sortable-table__row"></a>`);
      this.headersConfig.forEach((headerColumn) => {
        if (row[headerColumn.id]) {
          let cell = createElement(`
            <div class="sortable-table__cell">${headerColumn?.template ? headerColumn?.template(row[headerColumn.id]) : row[headerColumn.id]}</div>
          `);

          divRow.appendChild(cell);
        }
      });

      body.appendChild(divRow);
    });
  }

  public remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  public destroy() {
    this.remove();
    this.headersConfig = [];
    this.data = [];
  }
}
