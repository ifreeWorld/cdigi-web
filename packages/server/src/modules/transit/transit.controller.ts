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
import { TransitService } from './transit.service';
import { CurrentUser } from '../../decorators';
import { Pager } from '../../interface';
import { JwtGuard } from '../../guards';
import { getSkip } from '../../utils';
import { CustomResponse, ErrorConstant } from 'src/constant/error';
import {
  SearchDto,
  TransitListResult,
  TransitParseDto,
  TransitDeleteDto,
  TransitIdResult,
  TransitParseResult,
  TransitDataResult,
  TransitBooleanResult,
} from './transit.dto';
import { TransitEntity } from './transit.entity';
import { mimeType, transitSheetName } from '../../constant/file';

@ApiBearerAuth()
@ApiTags('在途库存')
@Controller('transit')
export class TransitController {
  constructor(private transitService: TransitService) {}

  /** 在途库存列表 */
  @UseGuards(JwtGuard)
  @Get('/list')
  @ApiOkResponse({
    type: TransitListResult,
  })
  async find(@Query() query: SearchDto): Promise<Pager<TransitEntity>> {
    const { current, pageSize } = query;
    const [list, total] = await this.transitService.find(
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
    type: TransitDataResult,
  })
  async findAll(@Query() query: SearchDto): Promise<TransitEntity[]> {
    const list = await this.transitService.findAll(query);
    return list;
  }

  /** 查询本周是否有数据 */
  @UseGuards(JwtGuard)
  @Get('/hasData')
  @ApiOkResponse({
    type: TransitBooleanResult,
  })
  async hasData(@Query() query: SearchDto): Promise<boolean> {
    const number = await this.transitService.findCount(query);
    return number > 0;
  }

  /** 解析文件 */
  @UseGuards(JwtGuard)
  @Post('/parseFile')
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({
    type: TransitParseResult,
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
    @Body() body: TransitParseDto,
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
      if (sheetName === transitSheetName) {
        flag = 1;
        const res = await this.transitService.parseSheet(
          workbook,
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
    type: TransitIdResult,
  })
  async delete(@Body() { inTimes, customerId }: TransitDeleteDto) {
    return this.transitService.delete(inTimes, customerId);
  }
}
