import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  FileTypeValidator,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiBearerAuth,
  ApiTags,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { read, utils } from 'xlsx';
import { StockService } from './stock.service';
import { Pager } from '../../interface';
import { JwtGuard } from '../../guards';
import { getSkip } from '../../utils';
import { FileUploadDto } from '../../dto';
import { CustomResponse, ErrorConstant } from 'src/constant/error';
import {
  SearchDto,
  StockListResult,
  StockParseDto,
  StockDeleteDto,
  StockIdResult,
  StockParseResult,
  StockDataResult,
} from './stock.dto';
import { StockEntity } from './stock.entity';
import {
  mimeType,
  stockSheetName,
  saleSheetName,
  onPassageStockSheetName,
} from '../../constant/file';

@ApiBearerAuth()
@ApiTags('库存')
@Controller('stock')
export class StockController {
  constructor(private stockService: StockService) {}

  /** 标签列表 */
  @UseGuards(JwtGuard)
  @Get('/list')
  @ApiOkResponse({
    type: StockListResult,
  })
  async find(@Query() query: SearchDto): Promise<Pager<StockEntity>> {
    const { current, pageSize } = query;
    const [list, total] = await this.stockService.find(
      getSkip(current, pageSize),
      pageSize,
      query,
    );
    return {
      list: list,
      total: total,
    };
  }

  /** 全量用户列表 */
  @UseGuards(JwtGuard)
  @Get('/all')
  @ApiOkResponse({
    type: StockDataResult,
  })
  async findAll(@Query() query: SearchDto): Promise<StockEntity[]> {
    const list = await this.stockService.findAll(query);
    return list;
  }

  /** 解析文件 */
  @UseGuards(JwtGuard)
  @Post('/parseFile')
  @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   description: 'List of cats',
  //   type: FileUploadDto,
  // })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        weekStartDate: { type: 'string' },
        weekEndDate: { type: 'string' },
        week: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({
    type: StockParseResult,
  })
  @UseInterceptors(FileInterceptor('file'))
  async parseFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: mimeType.xlsx,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() body: StockParseDto,
  ) {
    const workbook = read(file.buffer, { type: 'buffer' });
    const { SheetNames: sheetNames, Sheets: sheets } = workbook;
    const fileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    let flag = 0;

    for (let i = 0; i < sheetNames.length; i++) {
      const sheetName = sheetNames[i];
      const sheet = sheets[sheetName];
      if (sheetName === stockSheetName) {
        flag = 1;
        const res = await this.stockService.parseSheet(sheet, fileName, body);
        if (res instanceof ErrorConstant) {
          return res;
        }
      }
      // TODO 销售、在途库存
    }

    if (!flag) {
      throw new CustomResponse('sheet页名称不正确');
    }
    return true;
  }

  // /** 插入 */
  // @UseGuards(JwtGuard)
  // @Post('/add')
  // @ApiOkResponse({
  //   type: StockIdResult,
  // })
  // async batchInsert(
  //   @Body() body: StockCreateDto,
  //   @CurrentUser() currentUser,
  // ): Promise<number> {
  //   return this.stockService.batchInsert({
  //     ...body,
  //     creatorId: currentUser.id,
  //   });
  // }

  // /** 更新 */
  // @UseGuards(JwtGuard)
  // @Post('/update')
  // @ApiOkResponse({
  //   type: StockIdResult,
  // })
  // async update(@Body() body: StockUpdateDto): Promise<number> {
  //   return this.stockService.update(body.id, body);
  // }

  /**
   * 删除
   */
  @UseGuards(JwtGuard)
  @Post('/delete')
  @ApiOkResponse({
    type: StockIdResult,
  })
  async delete(@Body() { ids }: StockDeleteDto) {
    return this.stockService.delete(ids);
  }
}
