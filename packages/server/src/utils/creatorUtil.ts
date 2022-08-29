import * as validator from 'class-validator';
import { FindOptionsWhere, SelectQueryBuilder } from 'typeorm';

export const setCreatorWhere = (
  where: FindOptionsWhere<any>,
  creatorId: number,
) => {
  if (validator.isNotEmpty(creatorId)) {
    where.creatorId = creatorId;
  }
};

export const setCreatorQb = (
  qb: SelectQueryBuilder<any>,
  creatorId: number,
  alias: string,
) => {
  qb.where(`${alias}.creator_id = :creatorId`, { creatorId });
};
