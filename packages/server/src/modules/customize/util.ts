import { SelectQueryBuilder } from 'typeorm';
import * as validator from 'class-validator';
import { PivotColumn, PivotFilter, PivotValue } from './customize.interface';
import { random } from 'src/utils';

export const setFilterQb = (
  qb: SelectQueryBuilder<any>,
  filter: PivotFilter | PivotFilter[],
) => {
  if (!validator.isEmpty(filter)) {
    if (Array.isArray(filter)) {
      filter.forEach((item, index) => {
        const { field, op, value } = item;
        // 当前只支持in
        if (op === 'in') {
          const key = random();
          qb.andWhere(`${field} IN (:...${key})`, { [key]: value });
        }
      });
    } else {
      const { field, op, value } = filter;
      // 当前只支持in
      if (op === 'in') {
        const key = random();
        qb.andWhere(`${field} IN (:...${key})`, { [key]: value });
      }
    }
  }
};
