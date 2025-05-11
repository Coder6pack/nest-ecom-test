import {
	Body,
	Controller,
	FileTypeValidator,
	Get,
	MaxFileSizeValidator,
	NotFoundException,
	Param,
	ParseFilePipe,
	Post,
	Res,
	UploadedFiles,
	UseInterceptors,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { Response } from 'express'
import path from 'path'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { MediaService } from './media.service'
import { ParseFilePipeWithUnlink } from './parse-file-pipe-unlink.pipe'
import { ZodSerializerDto } from 'nestjs-zod'
import { PresignedUploadFileBodyDTO, PresignedUploadFileResDTO, UploadFilesResDTO } from './media.dto'
import { UPLOAD_DIR } from 'src/shared/constants/other.constant'

@Controller('media')
export class MediaController {
	constructor(private readonly mediaService: MediaService) {}
	@Post('images/upload')
	@ZodSerializerDto(UploadFilesResDTO)
	@UseInterceptors(
		FilesInterceptor('files', 10, {
			limits: {
				fileSize: 5 * 1024 * 1024, // 2MB
			},
		}),
	)
	uploadFile(
		@UploadedFiles(
			new ParseFilePipeWithUnlink({
				validators: [
					new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
					new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
				],
			}),
		)
		files: Array<Express.Multer.File>,
	) {
		return this.mediaService.uploadFile(files)
	}

	@Get('static/:filename')
	@IsPublic()
	getImage(@Param('filename') filename: string, @Res() res: Response) {
		return res.sendFile(path.resolve(UPLOAD_DIR, filename), (error) => {
			const notFound = new NotFoundException('file not found')
			if (error) {
				return res.status(notFound.getStatus()).json(notFound.getResponse())
			}
		})
	}

	@Post('images/upload/presigned-url')
	@ZodSerializerDto(PresignedUploadFileResDTO)
	@IsPublic()
	async createPresignedUrl(@Body() body: PresignedUploadFileBodyDTO) {
		return this.mediaService.getPresignedUrl(body)
	}
}
