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
} from '@nestjs/swagger';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { read } from 'xlsx';
import { StockService } from './stock.service';
import { CurrentUser } from '../../decorators';
import { Pager } from '../../interface';
import { JwtGuard } from '../../guards';
import { getSkip } from '../../utils';
import { CustomResponse, ErrorConstant } from 'src/constant/error';
import {
  SearchDto,
  StockListResult,
  StockParseDto,
  StockDeleteDto,
  StockIdResult,
  StockParseResult,
  StockDataResult,
  StockBooleanResult,
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

  /** 全量列表 */
  @UseGuards(JwtGuard)
  @Get('/all')
  @ApiOkResponse({
    type: StockDataResult,
  })
  async findAll(@Query() query: SearchDto): Promise<StockEntity[]> {
    const list = await this.stockService.findAll(query);
    return list;
  }

  /** 查询本周是否有数据 */
  @UseGuards(JwtGuard)
  @Get('/hasData')
  @ApiOkResponse({
    type: StockBooleanResult,
  })
  async hasData(@Query() query: SearchDto): Promise<boolean> {
    const number = await this.stockService.findCount(query);
    return number > 0;
  }

  /** 解析文件 */
  @UseGuards(JwtGuard)
  @Post('/parseFile')
  @ApiConsumes('multipart/form-data')
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
    @CurrentUser() currentUser,
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
        const res = await this.stockService.parseSheet(
          sheet,
          fileName,
          body,
          currentUser.id,
        );
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

  /**
   * 删除
   */
  @UseGuards(JwtGuard)
  @Post('/delete')
  @ApiOkResponse({
    type: StockIdResult,
  })
  async delete(@Body() { weeks }: StockDeleteDto) {
    return this.stockService.delete(weeks);
  }
}
