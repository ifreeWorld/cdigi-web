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

export const setColumnQb = async (
  qb: SelectQueryBuilder<any>,
  column: PivotColumn,
  value: PivotValue,
  creatorId: number,
  getAllValues: (field: string, creatorId: number) => any,
) => {
  if (!validator.isEmpty(column) && !validator.isEmpty(value)) {
    const { filter: columnFilter = { value: [] }, field: columnField } = column;
    const { value: filterValue } = columnFilter;
    const { field: valueField, aggregator } = value;
    // 用户选择了列的filter，就拼接CASE WHEN
    if (filterValue && filterValue.length > 0) {
      filterValue.forEach((v) => {
        qb.addSelect(
          `IFNULL(${aggregator}( CASE WHEN t.${columnField} = '${v}' THEN t.${valueField} END ),0)`,
          `${v}`,
        );
      });
    } else {
      // 用户没选择，就先查询数据库中column field的所有的选项
      const data = await getAllValues(columnField, creatorId);
      data.forEach((v) => {
        qb.addSelect(
          `IFNULL(${aggregator}( CASE WHEN t.${columnField} = '${v}' THEN t.${valueField} END ),0)`,
          `${v}`,
        );
      });
    }
    qb.addSelect(`${aggregator}( t.${valueField} )`, 'all');
  }
};
