import * as validator from 'class-validator';
import { TransitEntity } from './transit.entity';

export function getTree(entities: TransitEntity[]) {
  const temp = {};

  entities.forEach((entity) => {
    const { inTime, quantity, total, eta, shippingDate } = entity;
    let parent = temp[inTime];
    if (!parent) {
      parent = {
        ...entity,
        id: inTime,
        productName: '',
        storeName: '',
        price: null,
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
      if (parent.eta !== eta) {
        parent.eta = '';
      }
      if (parent.shippingDate !== shippingDate) {
        parent.shippingDate = '';
      }
    }
    parent.children.push(entity);
  });

  const result = Object.keys(temp).map((week) => temp[week]);
  return result;
}
