import {createElement} from "../../shared/utils/create-element";

type SortOrder = 'asc' | 'desc';

type SortableTableData = Record<string, string | number>;

type SortableTableSort = {
  id: string;
  order: SortOrder;
};

type CustomSorting = (a: SortableTableData, b: SortableTableData) => number;

type SortType = 'string' | 'number' | 'custom';

interface SortableTableHeader {
  id: string;
  title: string;
  sortable?: boolean;
  sortType?: SortType;
  template?: (value: string | number) => string;
  customSorting?: (a: SortableTableData, b: SortableTableData) => number;
}

interface Options {
  data?: SortableTableData[];
  sorted?: SortableTableSort;
  isSortLocally?: boolean;
}

export default class SortableTable {
  public element: HTMLElement;

  private data: SortableTableData[];
  private defaultSort: SortableTableSort | null;
  private readonly isSortLocally: boolean;
  private pointerDownEvent: ((event: PointerEvent) => void) | null = null;

  constructor(private headersConfig: SortableTableHeader[] = [], tableConfig: Options = {}) {
    this.data = tableConfig?.data || [];
    this.defaultSort = tableConfig?.sorted || null;
    this.isSortLocally = tableConfig?.isSortLocally ? tableConfig.isSortLocally : true;

    this.element = this.makeTableTemplate();
    if (this.defaultSort) {
      this.sort(this.defaultSort.id, this.defaultSort.order);
    }

    this.addSortingListeners(this.element);
  }

  public sort(field: string, order: SortOrder = 'asc') {
    if (this.isSortLocally) {
      this.sortOnClient(field, order);
    } else {
      return;
    }
  }

  public sortOnClient(field: string, order: SortOrder = 'asc') {
    const fieldInHeader
      = this.headersConfig.find((header) => header.id === field);
    const isFieldNotFound = !fieldInHeader;
    const isFieldNotSortable = fieldInHeader?.sortable !== true;
    if (isFieldNotFound || isFieldNotSortable) {
      return;
    }

    this.changeColumnsDataOrder(field, order);

    const sortType = fieldInHeader?.sortType || null;
    if (sortType) {
      let customSort = fieldInHeader?.customSorting
        || function (a, b) {
          return 0;
        };
      this.sortData(sortType, field, order, customSort);
    }

    this.rewriteBodyData();
  }

  public remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  public destroy() {
    this.headersConfig = [];
    this.data = [];
    if (this.pointerDownEvent) {
      const headerDiv = <HTMLDivElement>this.element.querySelector('div[data-element="header"]');
      headerDiv.removeEventListener('pointerdown', this.pointerDownEvent);
      this.pointerDownEvent = null;
    }
    this.remove();
  }

  private rewriteBodyData() {
    const bodyDiv
      = this.element?.querySelector<HTMLElement>('div[data-element="body"]');
    if (bodyDiv) {
      bodyDiv.innerHTML = '';
      this.makeTableBodyData(bodyDiv);
    }
  }

  private sortData(sortType: SortType, field: string, order: SortOrder, customSort: CustomSorting) {
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

      if (sortType === 'custom') {
        let compareResult = customSort(a, b);
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
        if (row[headerColumn.id] != null) {
          let cell = createElement(`
            <div class="sortable-table__cell">${headerColumn?.template ? headerColumn?.template(row[headerColumn.id]) : row[headerColumn.id]}</div>
          `);

          divRow.appendChild(cell);
        }
      });

      body.appendChild(divRow);
    });
  }

  private addSortingListeners(tableDiv: HTMLElement) {
    const headerDiv = <HTMLDivElement>tableDiv.querySelector('div[data-element="header"]');
    this.pointerDownEvent = (event: PointerEvent) => {
      const clickedElement = event.target as HTMLElement;
      let columnCell = clickedElement.closest<HTMLElement>('[data-sortable="true"]');
      if (columnCell && columnCell.dataset.id) {
        const order = columnCell.dataset.order ? columnCell.dataset.order : undefined;
        if (order === 'desc') {
          this.sort(columnCell.dataset.id, 'asc');
        } else {
          this.sort(columnCell.dataset.id, 'desc');
        }
      }
    };

    headerDiv.addEventListener('pointerdown', this.pointerDownEvent);
  }
}
