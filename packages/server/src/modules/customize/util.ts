import { SelectQueryBuilder } from 'typeorm';
import * as validator from 'class-validator';
import { PivotColumn, PivotFilter, PivotValue } from './customize.interface';

export const setFilterQb = (
  qb: SelectQueryBuilder<any>,
  filter: PivotFilter | PivotFilter[],
) => {
  if (!validator.isEmpty(filter)) {
    if (Array.isArray(filter)) {
      filter.forEach((item) => {
        const { field, op, value } = item;
        // 当前只支持in
        if (op === 'in') {
          qb.where(`${field} IN (:...value)`, { value });
        }
      });
    } else {
      const { field, op, value } = filter;
      // 当前只支持in
      if (op === 'in') {
        qb.where(`${field} IN (:...value)`, { value });
      }
    }
  }
};

export const setColumnQb = async (
  qb: SelectQueryBuilder<any>,
  column: PivotColumn,
  value: PivotValue,
  getAllValues: Function,
) => {
  if (!validator.isEmpty(column) && !validator.isEmpty(value)) {
    const { filter: columnFilter, field: columnField } = column;
    const { value: filterValue } = columnFilter;
    const { field: valueField, aggregator } = value;
    // 用户选择了列的filter，就拼接CASE WHEN
    if (filterValue && filterValue.length > 0) {
      filterValue.forEach((v) => {
        qb.addSelect(
          `IFNULL(${aggregator}( CASE WHEN t.${columnField} = ${v} THEN t.${valueField} END ),0)`,
          `${v}`,
        );
      });
    } else {
      // 用户没选择，就先查询数据库中column field的所有的选项
      const data = await getAllValues(columnField);
      data.forEach((v) => {
        qb.addSelect(
          `IFNULL(${aggregator}( CASE WHEN t.${columnField} = ${v} THEN t.${valueField} END ),0)`,
          `${v}`,
        );
      });
    }
    qb.addSelect(`${aggregator}( t.${valueField} )`, 'all');
  }
};
