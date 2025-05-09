import { Injectable } from '@nestjs/common'
import { unlink } from 'fs/promises'
import { generateRandomFileName } from 'src/shared/helpers'
import { S3Service } from 'src/shared/services/s3.service'
import { PresignedUploadFileBodyType } from './media.model'

@Injectable()
export class MediaService {
	constructor(private readonly s3Service: S3Service) {}

	async uploadFile(files: Array<Express.Multer.File>) {
		const result = await Promise.all(
			files.map((file) => {
				return this.s3Service
					.uploadFile({
						fileName: `images/${file.filename}`,
						filePath: file.path,
						contentType: file.mimetype,
					})
					?.then((res) => {
						return {
							url: res.Location,
						}
					})
			}),
		)
		// Delete local files after upload to S3
		await Promise.all(files.map((file) => unlink(file.path)))
		return {
			data: result,
		}
	}
	async getPresignedUrl(body: PresignedUploadFileBodyType) {
		const randomFilename = generateRandomFileName(body.filename)
		const presignedUrl = await this.s3Service.createPresignedUrlWithClient(randomFilename)
		const url = presignedUrl.split('?')[0]
		return {
			presignedUrl,
			url,
		}
	}
}
