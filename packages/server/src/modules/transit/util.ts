import * as validator from 'class-validator';
import { TransitEntity } from './transit.entity';

export function getTree(entities: TransitEntity[]) {
  const temp = {};

  entities.forEach((entity) => {
    const { inTime, quantity, total } = entity;
    let parent = temp[inTime];
    if (!parent) {
      parent = {
        ...entity,
        id: inTime,
        productName: '',
        storeName: '',
        price: null,
        eta: '',
        shippingDate: '',
        children: [],
      };
      temp[inTime] = parent;
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
