import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const uploadDir = path.join(process.cwd(), 'public/uploads')
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  try {
    const form = formidable({
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, 
    })

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err)
        resolve([fields, files])
      })
    })

    console.log('Files:', files)

    const fileKey = Object.keys(files)[0]
    const uploadedFile = Array.isArray(files[fileKey]) ? files[fileKey][0] : files[fileKey]

    if (!uploadedFile) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const filename = uploadedFile.newFilename || uploadedFile.name

    const fileUrl = `/uploads/${filename}`

    return res.status(200).json({
      imageUrl: fileUrl,
      success: true,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json({
      message: 'File upload failed',
      error: error.message,
    })
  }
}
