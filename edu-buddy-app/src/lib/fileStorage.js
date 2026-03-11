// File Storage and Management Service
// Handles file uploads, downloads, and tracking

import { supabase } from './supabase'

// =============================================
// FILE UPLOAD
// =============================================

export const uploadFile = async (file, folder = 'uploads', onProgress = null) => {
  try {
    const timestamp = Date.now()
    const uniqueName = `${timestamp}_${file.name}`
    const path = `${folder}/${uniqueName}`

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(path)

    return {
      success: true,
      fileName: file.name,
      originalName: file.name,
      size: file.size,
      type: file.type,
      path: path,
      url: urlData.publicUrl,
      uploadedAt: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    return {
      success: false,
      error: error.message,
      fileName: file.name
    }
  }
}

export const uploadMultipleFiles = async (files, folder = 'uploads', onProgress = null) => {
  const results = []

  for (let i = 0; i < files.length; i++) {
    const result = await uploadFile(files[i], folder)
    results.push(result)

    if (onProgress) {
      onProgress({
        current: i + 1,
        total: files.length,
        percentage: Math.round(((i + 1) / files.length) * 100)
      })
    }
  }

  return results
}

// =============================================
// FILE RETRIEVAL
// =============================================

export const getFile = async (path) => {
  try {
    const { data, error } = await supabase.storage
      .from('documents')
      .download(path)

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error downloading file:', error)
    return null
  }
}

export const getFileUrl = (path) => {
  const { data } = supabase.storage
    .from('documents')
    .getPublicUrl(path)

  return data.publicUrl
}

export const listFiles = async (folder = 'uploads') => {
  try {
    const { data, error } = await supabase.storage
      .from('documents')
      .list(folder)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error listing files:', error)
    return []
  }
}

// =============================================
// FILE DELETION
// =============================================

export const deleteFile = async (path) => {
  try {
    const { error } = await supabase.storage
      .from('documents')
      .remove([path])

    if (error) throw error
    return { success: true, path }
  } catch (error) {
    console.error('Error deleting file:', error)
    return { success: false, error: error.message, path }
  }
}

export const deleteMultipleFiles = async (paths) => {
  try {
    const { error } = await supabase.storage
      .from('documents')
      .remove(paths)

    if (error) throw error
    return { success: true, count: paths.length }
  } catch (error) {
    console.error('Error deleting files:', error)
    return { success: false, error: error.message }
  }
}

// =============================================
// FILE METADATA
// =============================================

export const extractPDFText = async (file) => {
  try {
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    let text = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items.map(item => item.str).join(' ')
      text += pageText + ' '
    }

    return {
      success: true,
      text: text.trim(),
      pageCount: pdf.numPages
    }
  } catch (error) {
    console.error('Error extracting PDF text:', error)
    return { success: false, error: error.message }
  }
}

export const extractTextFile = async (file) => {
  try {
    const text = await file.text()
    return {
      success: true,
      text: text.trim(),
      lineCount: text.split('\n').length
    }
  } catch (error) {
    console.error('Error extracting text file:', error)
    return { success: false, error: error.message }
  }
}

export const getFileMetadata = (file) => {
  const extension = file.name.split('.').pop().toLowerCase()

  return {
    name: file.name,
    size: file.size,
    type: file.type,
    extension: extension,
    lastModified: new Date(file.lastModified).toISOString(),
    isImage: ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension),
    isPDF: extension === 'pdf',
    isText: ['txt', 'doc', 'docx'].includes(extension)
  }
}

// =============================================
// FILE VALIDATION
// =============================================

export const validateFile = (file, options = {}) => {
  const {
    acceptedTypes = ['.pdf', '.txt', '.doc', '.docx', '.jpg', '.png', '.jpeg'],
    maxSize = 50 // MB
  } = options

  const errors = []

  // Check file type
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
  if (!acceptedTypes.includes(fileExtension) && !acceptedTypes.includes('*')) {
    errors.push(`File type ${fileExtension} not allowed`)
  }

  // Check file size
  const fileSizeMB = file.size / (1024 * 1024)
  if (fileSizeMB > maxSize) {
    errors.push(`File size exceeds maximum of ${maxSize}MB`)
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  }
}

// =============================================
// FILE PROCESSING
// =============================================

export const processFile = async (file, processType = 'auto') => {
  const metadata = getFileMetadata(file)

  try {
    if (processType === 'extract-text' || (processType === 'auto' && metadata.isPDF)) {
      return await extractPDFText(file)
    } else if (processType === 'extract-text' || (processType === 'auto' && metadata.isText)) {
      return await extractTextFile(file)
    } else {
      return {
        success: true,
        fileName: file.name,
        fileType: metadata.extension,
        size: metadata.size
      }
    }
  } catch (error) {
    console.error('Error processing file:', error)
    return { success: false, error: error.message }
  }
}

// =============================================
// FILE UTILITY FUNCTIONS
// =============================================

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes, k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase()
  const iconMap = {
    pdf: 'picture_as_pdf',
    txt: 'text_snippet',
    doc: 'description',
    docx: 'description',
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    zip: 'folder_zip',
    rar: 'folder_zip'
  }
  return iconMap[extension] || 'attachment'
}

export const getFileCategory = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase()
  const categories = {
    documents: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
    images: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    archives: ['zip', 'rar', '7z', 'tar'],
    code: ['js', 'jsx', 'py', 'java', 'cpp', 'html', 'css']
  }

  for (const [category, extensions] of Object.entries(categories)) {
    if (extensions.includes(extension)) {
      return category
    }
  }

  return 'other'
}

// =============================================
// STORAGE MANAGEMENT
// =============================================

export const getStorageQuota = async () => {
  try {
    // This would require a custom function in Supabase
    // For now, return a placeholder
    return {
      used: 0,
      total: 10 * 1024 * 1024 * 1024, // 10GB
      percentage: 0
    }
  } catch (error) {
    console.error('Error getting storage quota:', error)
    return null
  }
}

export const createStorageFolder = (folderName) => {
  return `${folderName}/.keep`
}
