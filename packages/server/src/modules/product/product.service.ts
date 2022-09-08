import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository, DataSource } from 'typeorm';
import * as validator from 'class-validator';
import { WorkBook, WorkSheet, utils, write } from 'xlsx';
import * as fs from 'fs';
import * as moment from 'moment';
import { plainToInstance } from 'class-transformer';
import { ProductEntity } from './product.entity';
import {
  SearchDto,
  ProductCreateDto,
  ProductUpdateDto,
  ProductInnerParseResult,
  ProductSaveDto,
} from './product.dto';
import { ERROR, ErrorConstant } from 'src/constant/error';
import { indexOfLike, setCreatorWhere } from '../../utils';
import {
  productHeaderMap,
  productSheetName,
  tmpPath,
} from '../../constant/file';
import { TagService } from '../tag/tag.service';
import { appLogger } from 'src/logger';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private repository: Repository<ProductEntity>,
    private tagService: TagService,
    private dataSource: DataSource,
  ) {}

  /**
   * 分页按条件查询
   */
  async find(
    creatorId: number,
    skip: number,
    take: number,
    query: SearchDto,
  ): Promise<[ProductEntity[], number]> {
    const where: FindOptionsWhere<ProductEntity> = {};
    const {
      productName,
      vendorName,
      categoryFirstName,
      categorySecondName,
      categoryThirdName,
    } = query;
    if (validator.isNotEmpty(productName)) {
      where.productName = indexOfLike(productName);
    }
    if (validator.isNotEmpty(vendorName)) {
      where.vendorName = indexOfLike(vendorName);
    }
    if (validator.isNotEmpty(categoryFirstName)) {
      where.categoryFirstName = indexOfLike(categoryFirstName);
    }
    if (validator.isNotEmpty(categorySecondName)) {
      where.categorySecondName = indexOfLike(categorySecondName);
    }
    if (validator.isNotEmpty(categoryThirdName)) {
      where.categoryThirdName = indexOfLike(categoryThirdName);
    }
    setCreatorWhere(where, creatorId);
    return await this.repository.findAndCount({
      where: where,
      take: take,
      skip: skip,
      relations: {
        tags: true,
      },
    });
  }

  /**
   * 全量查询
   */
  async findAll(creatorId: number, query: SearchDto): Promise<ProductEntity[]> {
    const where: FindOptionsWhere<ProductEntity> = {};
    const {
      productName,
      vendorName,
      categoryFirstName,
      categorySecondName,
      categoryThirdName,
    } = query;
    if (validator.isNotEmpty(productName)) {
      where.productName = indexOfLike(productName);
    }
    if (validator.isNotEmpty(vendorName)) {
      where.vendorName = vendorName;
    }
    if (validator.isNotEmpty(categoryFirstName)) {
      where.categoryFirstName = categoryFirstName;
    }
    if (validator.isNotEmpty(categorySecondName)) {
      where.categorySecondName = categorySecondName;
    }
    if (validator.isNotEmpty(categoryThirdName)) {
      where.categoryThirdName = categoryThirdName;
    }
    setCreatorWhere(where, creatorId);
    return await this.repository.find({
      where: where,
      relations: {
        tags: false,
      },
    });
  }

  /**
   * 新增
   */
  async insert(
    info: ProductCreateDto & {
      creatorId: number;
    },
  ): Promise<number> {
    const entity = plainToInstance(ProductEntity, {
      ...info,
    });
    const res = await this.dataSource.manager.save(entity);
    return res.id;
  }

  /**
   * 解析数据插入数据
   */
  async parseSheet(
    workbook: WorkBook,
    sheet: WorkSheet,
    fileName: string,
    creatorId: number,
  ): Promise<ProductInnerParseResult | ErrorConstant> {
    const arrs = utils.sheet_to_json<any[]>(sheet, {
      header: 1,
    });
    if (arrs.length === 0) {
      return;
    }

    // [库存 - 型号	库存 - 门店	库存 - 数量]表头数据，顺序不一定
    const headers = arrs[0];
    // {productName: 0, 库存 - 门店: 1, 库存 - 数量: 2}
    const colMap: any = {};
    headers.forEach((header, index) => {
      const key = productHeaderMap[header];
      if (key) {
        colMap[key] = index;
      }
    });

    // {tagName:tagId}的map
    const allTagMap = {};
    const allTag = await this.tagService.findAll(creatorId);
    const allTagNames = allTag.map((item) => {
      allTagMap[item.tagName] = item.id;
      return item.tagName;
    });
    // {productName:productId}的map
    const allProductMap = {};
    const allProduct = await this.findAll(creatorId, {});
    const allProductNames = allProduct.map((item) => {
      allProductMap[item.productName] = item.id;
      return item.productName;
    });

    const data = utils.sheet_to_json(sheet);
    const result = data.map((item) => {
      const temp: Partial<ProductEntity & { tags: string }> = {
        creatorId,
      };
      for (const oldKey in productHeaderMap) {
        if (item.hasOwnProperty(oldKey)) {
          const newKey = productHeaderMap[oldKey];
          temp[newKey] = item[oldKey];
        }
      }
      return temp;
    });
    const entities = result;

    // 校验
    const errors = [];
    const repeat = [];
    for (let rowIndex = 0; rowIndex < entities.length; rowIndex++) {
      const errorsTemp = [];
      const entity = entities[rowIndex];
      const {
        productName,
        vendorName,
        categoryFirstName,
        categorySecondName,
        categoryThirdName,
        tags,
      } = entity;

      // 产品型号没填写，必填字段
      if (!productName) {
        // 单元格位置文本，A1 B2
        const position = `${utils.encode_cell({
          c: colMap.productName,
          r: rowIndex + 1,
        })}`;
        const errMsg = `位置: ${position} 产品型号"${productName}"没填写`;
        errorsTemp.push(errMsg);
      }
      // 产品型号重复，系统中已存在，就直接给赋值一下id
      if (allProductNames.includes(productName)) {
        entity.id = allProductMap[productName];
        repeat.push(productName);
      }

      // 品牌没填写，必填字段
      if (!vendorName) {
        // 单元格位置文本，A1 B2
        const position = `${utils.encode_cell({
          c: colMap.vendorName,
          r: rowIndex + 1,
        })}`;
        const errMsg = `位置: ${position} 品牌"${vendorName}"没填写`;
        errorsTemp.push(errMsg);
      }

      if (categoryFirstName && String(categoryFirstName).length > 255) {
        // 单元格位置文本，A1 B2
        const position = `${utils.encode_cell({
          c: colMap.categoryFirstName,
          r: rowIndex + 1,
        })}`;
        const errMsg = `位置: ${position} 一级分类"${categoryFirstName}"超出长度限制`;
        errorsTemp.push(errMsg);
      }

      if (categorySecondName && String(categorySecondName).length > 255) {
        // 单元格位置文本，A1 B2
        const position = `${utils.encode_cell({
          c: colMap.categorySecondName,
          r: rowIndex + 1,
        })}`;
        const errMsg = `位置: ${position} 二级分类"${categorySecondName}"超出长度限制`;
        errorsTemp.push(errMsg);
      }

      if (categoryThirdName && String(categoryThirdName).length > 255) {
        // 单元格位置文本，A1 B2
        const position = `${utils.encode_cell({
          c: colMap.categoryThirdName,
          r: rowIndex + 1,
        })}`;
        const errMsg = `位置: ${position} 三级分类"${categoryThirdName}"超出长度限制`;
        errorsTemp.push(errMsg);
      }

      // 有填写标签的情况下
      if (tags) {
        // 标签不在系统中
        if (!allTagNames.includes(tags)) {
          // 单元格位置文本，A1 B2
          const position = `${utils.encode_cell({
            c: colMap.tags,
            r: rowIndex + 1,
          })}`;
          const errMsg = `位置: ${position} 标签"${categorySecondName}"不在系统中`;
          errorsTemp.push(errMsg);
        } else {
          // 标签在系统中，就给tags赋值
          // @ts-ignore
          entity.tags = [{ id: allTagMap[tags] }];
        }
      }

      // 有失败的话，就在entity中添加失败原因，方便进行导出
      if (errorsTemp.length > 0) {
        data[rowIndex]['失败原因'] = errorsTemp.join('，');
      }
      errors.push(...errorsTemp);
    }

    if (errors.length > 0) {
      const errorSheet = utils.json_to_sheet(data, {
        header: [...headers, '失败原因'],
      });
      const workbook = utils.book_new();
      appLogger.error(errors.join('\n'));
      utils.book_append_sheet(workbook, errorSheet, productSheetName);

      const buf = write(workbook, { type: 'buffer', bookType: 'xlsx' });
      const errorFileName = `${
        fileName.split('.xlsx')[0]
      }_错误原因_${moment().format('YYYY_MM_DD_hh_mm_ss')}.xlsx`;
      const errorFilePath = `${tmpPath}/${errorFileName}`;
      fs.writeFileSync(errorFilePath, buf);
      const e = new ErrorConstant(
        6,
        '文件校验失败，详情请查看下载的文件',
        errorFileName,
      );
      return e;
    }

    const resultEntities = plainToInstance(ProductEntity, entities);
    return {
      data: resultEntities,
      repeatCount: repeat.length,
      repeat,
    };

    // 增加一个事务，保存
    let res;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      res = await queryRunner.manager.save(resultEntities);
      await queryRunner.commitTransaction();
    } catch (err) {
      // since we have errors lets rollback the changes we made
      appLogger.error(err);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }

    return res.length;
  }

  async save({ data }: ProductSaveDto) {
    const entities = plainToInstance(ProductEntity, data);

    // 增加一个事务，直接调用save保存，有id的编辑，无id的插入
    let res;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      res = await this.dataSource.manager.save(entities);
      await queryRunner.commitTransaction();
    } catch (err) {
      // since we have errors lets rollback the changes we made
      appLogger.error(err);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }

    return res.length;
  }

  /** 修改 */
  async update(id: number, data: Partial<ProductUpdateDto>): Promise<number> {
    const info = await this.repository.findOneBy({
      id,
    });
    if (!info) {
      throw ERROR.RESOURCE_NOT_EXITS;
    }
    const entity = plainToInstance(ProductEntity, {
      ...info,
      ...data,
    });
    const res = await this.dataSource.manager.save(entity);
    return res.id;
  }
  /**
   * 根据 ids 删除
   * @param ids
   */
  async delete(ids: number[]): Promise<boolean> {
    await this.repository.delete(ids);
    return true;
  }
}
