import { ParseFileOptions, ParseFilePipe } from '@nestjs/common'
import { unlink } from 'fs/promises'

export class ParseFilePipeWithUnlink extends ParseFilePipe {
	constructor(option?: ParseFileOptions) {
		super(option)
	}

	async transform(files: Array<Express.Multer.File>): Promise<any> {
		return super.transform(files).catch(async (error) => {
			await Promise.all(files.map((file) => unlink(file.path)))
			throw error
		})
	}
}
