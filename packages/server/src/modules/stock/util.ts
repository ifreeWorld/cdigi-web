import * as validator from 'class-validator';
import { StockEntity } from './stock.entity';

export function getTree(entities: StockEntity[]) {
  const temp = {};

  entities.forEach((entity) => {
    const { week, quantity, total } = entity;
    let parent = temp[week];
    if (!parent) {
      parent = {
        ...entity,
        id: week,
        productName: '',
        storeName: '',
        price: null,
        children: [],
      };
      temp[week] = parent;
    } else {
      if (quantity && validator.isNumber(quantity)) {
        parent.quantity += quantity;
      }
      if (total && validator.isNumber(total)) {
        parent.total += total;
      }
    }
    parent.children.push(entity);
  });

  const result = Object.keys(temp).map((week) => temp[week]);
  return result;
}
