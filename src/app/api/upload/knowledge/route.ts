import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import {
  validateFile,
  validateRequiredParams,
  validatePathParameter,
  handleFileSystemError,
  handleDatabaseError,
  createErrorNextResponse,
  getFileConfig,
  logUploadError,
  UploadErrorCode,
} from '@/utils/uploadErrorHandler'

export async function POST(request: NextRequest) {
  const endpoint = '/api/upload/knowledge'

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const knowledgeId = formData.get('knowledgeId') as string

    const paramValidation = validateRequiredParams({ file, knowledgeId })
    if (!paramValidation.valid && paramValidation.error) {
      logUploadError(endpoint, paramValidation.error, { knowledgeId })
      return createErrorNextResponse(
        UploadErrorCode.MISSING_FILE,
        paramValidation.error.error,
        paramValidation.error.message,
      )
    }

    const pathValidation = validatePathParameter(knowledgeId, 'knowledgeId')
    if (!pathValidation.valid && pathValidation.error) {
      logUploadError(endpoint, pathValidation.error, { knowledgeId })
      return NextResponse.json(pathValidation.error, { status: 400 })
    }

    const config = getFileConfig('knowledge')
    const fileValidation = validateFile(file, config)
    if (!fileValidation.valid && fileValidation.error) {
      logUploadError(endpoint, fileValidation.error, {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        knowledgeId,
      })
      return NextResponse.json(fileValidation.error, {
        status:
          fileValidation.error.code === 'FILE_SIZE_EXCEEDED'
            ? 413
            : fileValidation.error.code === 'FILE_TYPE_INVALID'
              ? 415
              : 400,
      })
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'knowledge', knowledgeId)

    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      const fsError = handleFileSystemError(error, 'directory creation')
      logUploadError(endpoint, error, { uploadDir, knowledgeId })
      return NextResponse.json(fsError, { status: 500 })
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const filename = `${uuidv4()}.${fileExtension}`
    const filepath = join(uploadDir, filename)

    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filepath, buffer)
    } catch (error) {
      const fsError = handleFileSystemError(error, 'file write')
      logUploadError(endpoint, error, { filepath, knowledgeId })
      return NextResponse.json(fsError, { status: 500 })
    }

    const url = `/uploads/knowledge/${knowledgeId}/${filename}`
    const mediaType = file.type.startsWith('video/') ? 'video' : 'image'

    try {
      const mediaRecord = await prisma.media.create({
        data: {
          url,
          type: mediaType,
          knowledge: { connect: { id: knowledgeId } },
        },
      })

      console.log('Knowledge upload successful:', {
        endpoint,
        fileName: file.name,
        fileSize: file.size,
        knowledgeId,
        mediaId: mediaRecord.id,
        timestamp: new Date().toISOString(),
      })

      return NextResponse.json({
        id: mediaRecord.id,
        url,
        type: mediaType,
        filename,
        size: file.size,
      })
    } catch (error) {
      const dbError = handleDatabaseError(error, 'knowledge media creation')
      logUploadError(endpoint, error, { url, knowledgeId })
      return NextResponse.json(dbError, { status: 500 })
    }
  } catch (error) {
    logUploadError(endpoint, error, { message: 'Unexpected error in knowledge upload handler' })

    return createErrorNextResponse(
      UploadErrorCode.STORAGE_ERROR,
      'Upload failed',
      'An unexpected error occurred during knowledge upload. Please try again.',
    )
  }
}
