import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { read } from 'xlsx';
import { CurrentUser } from '../../decorators';
import { StoreService } from './store.service';
import { Pager } from '../../interface';
import { JwtGuard } from '../../guards';
import { getSkip } from '../../utils';
import {
  SearchDto,
  StoreListResult,
  StoreDataResult,
  StoreCreateDto,
  StoreUpdateDto,
  StoreDeleteDto,
  StoreIdResult,
  StoreParseResult,
  StoreParseDto,
} from './store.dto';
import { StoreEntity } from './store.entity';
import { CustomResponse, ErrorConstant } from 'src/constant/error';
import { mimeType, storeSheetName } from '../../constant/file';

@ApiBearerAuth()
@ApiTags('门店')
@Controller('store')
export class StoreController {
  constructor(private storeService: StoreService) {}

  /** 门店列表 */
  @UseGuards(JwtGuard)
  @Get('/list')
  @ApiOkResponse({
    type: StoreListResult,
  })
  async find(
    @Query() query: SearchDto,
    @CurrentUser() currentUser,
  ): Promise<Pager<StoreEntity>> {
    const { current, pageSize } = query;
    const [list, total] = await this.storeService.find(
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
    type: StoreDataResult,
  })
  async findAll(
    @Query() query: SearchDto,
    @CurrentUser() currentUser,
  ): Promise<StoreEntity[]> {
    const list = await this.storeService.findAll({
      ...query,
      creatorId: currentUser.id,
    });
    return list;
  }

  /** 创建 */
  @UseGuards(JwtGuard)
  @Post('/add')
  @ApiOkResponse({
    type: StoreIdResult,
  })
  async insert(
    @Body() body: StoreCreateDto,
    @CurrentUser() currentUser,
  ): Promise<number> {
    return this.storeService.insert({
      ...body,
      creatorId: currentUser.id,
    });
  }

  /** 解析文件 */
  @UseGuards(JwtGuard)
  @Post('/parseFile')
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({
    type: StoreParseResult,
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
    @Body() body: StoreParseDto,
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
      if (sheetName === storeSheetName) {
        flag = 1;
        const res = await this.storeService.parseSheet(
          workbook,
          sheet,
          fileName,
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

  /** 更新 */
  @UseGuards(JwtGuard)
  @Post('/update')
  @ApiOkResponse({
    type: StoreIdResult,
  })
  async update(@Body() body: StoreUpdateDto): Promise<number> {
    return this.storeService.update(body.id, body);
  }

  /**
   * 删除
   */
  @UseGuards(JwtGuard)
  @Post('/delete')
  @ApiOkResponse({
    type: StoreIdResult,
  })
  async delete(@Body() { ids }: StoreDeleteDto) {
    return this.storeService.delete(ids);
  }
}
