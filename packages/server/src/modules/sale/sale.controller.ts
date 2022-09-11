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
  Res,
  StreamableFile,
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
import { CustomResponse } from 'src/constant/error';
import {
  SearchDto,
  SaleListResult,
  SaleParseDto,
  SaleDeleteDto,
  SaleSaveDto,
  SaleIdResult,
  SaleParseResult,
  SaleDataResult,
  SaleBooleanResult,
} from './sale.dto';
import { SaleEntity } from './sale.entity';
import { mimeType, saleSheetName, dateFormat } from '../../constant/file';

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
  async find(
    @Query() query: SearchDto,
    @CurrentUser() currentUser,
  ): Promise<Pager<SaleEntity>> {
    const { current, pageSize } = query;
    const [list, total] = await this.saleService.find(
      currentUser.id,
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
  async findAll(
    @Query() query: SearchDto,
    @CurrentUser() currentUser,
  ): Promise<SaleEntity[]> {
    const list = await this.saleService.findAll(currentUser.id, query);
    return list;
  }

  /** 查询本周是否有数据 */
  @UseGuards(JwtGuard)
  @Get('/hasData')
  @ApiOkResponse({
    type: SaleBooleanResult,
  })
  async hasData(
    @Query() query: SearchDto,
    @CurrentUser() currentUser,
  ): Promise<boolean> {
    const number = await this.saleService.findCount(currentUser.id, query);
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
    const workbook = read(file.buffer, {
      type: 'buffer',
      cellDates: true,
      cellText: false,
    });
    const { SheetNames: sheetNames, Sheets: sheets } = workbook;
    const fileName = Buffer.from(file.originalname, 'latin1').toString('utf8');

    let flag = 0;

    for (let i = 0; i < sheetNames.length; i++) {
      const sheetName = sheetNames[i];
      const sheet = sheets[sheetName];
      if (sheetName === saleSheetName) {
        flag = 1;
        const res = await this.saleService.parseSheet(
          workbook,
          sheet,
          fileName,
          body,
          currentUser.id,
        );
        return res;
      }
    }

    if (!flag) {
      throw new CustomResponse('sheet页名称不正确');
    }
  }

  /**
   * 保存数据
   */
  @UseGuards(JwtGuard)
  @Post('/save')
  @ApiOkResponse({
    type: Number,
  })
  async save(@Body() body: SaleSaveDto) {
    return this.saleService.save(body);
  }

  /** 导出数据 */
  @UseGuards(JwtGuard)
  @Get('/export')
  async export(
    @Res({ passthrough: true }) res,
    @CurrentUser() currentUser,
    @Query('customerId') customerId: number,
  ): Promise<StreamableFile> {
    const buf = await this.saleService.export(customerId, currentUser.id);
    const fileName = 'download_sale';
    res.set({
      'Content-Type': mimeType.xlsx,
      'Content-Disposition': `attachment; filename=${fileName}`,
    });
    return new StreamableFile(buf);
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
