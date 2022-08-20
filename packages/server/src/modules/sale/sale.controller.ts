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
import { SaleService } from './sale.service';
import { CurrentUser } from '../../decorators';
import { Pager } from '../../interface';
import { JwtGuard } from '../../guards';
import { getSkip } from '../../utils';
import { CustomResponse, ErrorConstant } from 'src/constant/error';
import {
  SearchDto,
  SaleListResult,
  SaleParseDto,
  SaleDeleteDto,
  SaleIdResult,
  SaleParseResult,
  SaleDataResult,
  SaleBooleanResult,
} from './sale.dto';
import { SaleEntity } from './sale.entity';
import { mimeType, saleSheetName } from '../../constant/file';

@ApiBearerAuth()
@ApiTags('销售')
@Controller('sale')
export class SaleController {
  constructor(private saleService: SaleService) {}

  /** 销售列表 */
  @UseGuards(JwtGuard)
  @Get('/list')
  @ApiOkResponse({
    type: SaleListResult,
  })
  async find(@Query() query: SearchDto): Promise<Pager<SaleEntity>> {
    const { current, pageSize } = query;
    const [list, total] = await this.saleService.find(
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
    type: SaleDataResult,
  })
  async findAll(@Query() query: SearchDto): Promise<SaleEntity[]> {
    const list = await this.saleService.findAll(query);
    return list;
  }

  /** 查询本周是否有数据 */
  @UseGuards(JwtGuard)
  @Get('/hasData')
  @ApiOkResponse({
    type: SaleBooleanResult,
  })
  async hasData(@Query() query: SearchDto): Promise<boolean> {
    const number = await this.saleService.findCount(query);
    return number > 0;
  }

  /** 解析文件 */
  @UseGuards(JwtGuard)
  @Post('/parseFile')
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({
    type: SaleParseResult,
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
    @Body() body: SaleParseDto,
    @CurrentUser() currentUser,
  ) {
    const workbook = read(file.buffer, { type: 'buffer', cellDates: true });
    const { SheetNames: sheetNames, Sheets: sheets } = workbook;
    const fileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    let flag = 0;

    for (let i = 0; i < sheetNames.length; i++) {
      const sheetName = sheetNames[i];
      const sheet = sheets[sheetName];
      if (sheetName === saleSheetName) {
        flag = 1;
        const res = await this.saleService.parseSheet(
          sheet,
          fileName,
          body,
          currentUser.id,
        );
        if (res instanceof ErrorConstant) {
          return res;
        }
      }
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
    type: SaleIdResult,
  })
  async delete(@Body() { weeks, customerId }: SaleDeleteDto) {
    return this.saleService.delete(weeks, customerId);
  }
}
