import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTracking } from '../context/TrackingContext'
import { supabase } from '../lib/supabase'

export default function FileUpload({
  onFileUpload = () => {},
  onProgress = () => {},
  acceptedTypes = ['.pdf', '.txt', '.doc', '.docx', '.jpg', '.png', '.jpeg'],
  maxSize = 50, // MB
  multiple = false,
  showPreview = true,
  autoProcess = false,
  storageFolder = 'uploads'
}) {
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const [errors, setErrors] = useState([])
  const { trackActivity, trackEvent } = useTracking()

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes, k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const validateFile = (file) => {
    const errors = []

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
    if (!acceptedTypes.includes(fileExtension) && !acceptedTypes.includes('*')) {
      errors.push(`File type ${fileExtension} not allowed. Accepted: ${acceptedTypes.join(', ')}`)
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      errors.push(`File size ${fileSizeMB.toFixed(2)}MB exceeds maximum of ${maxSize}MB`)
    }

    return errors
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const handleFiles = async (newFiles) => {
    const newErrors = []
    let validFiles = []

    for (const file of newFiles) {
      const fileErrors = validateFile(file)
      if (fileErrors.length > 0) {
        newErrors.push(...fileErrors)
      } else {
        validFiles.push(file)
      }
    }

    if (!multiple && validFiles.length > 0) {
      validFiles = [validFiles[0]]
    }

    if (newErrors.length > 0) {
      setErrors(newErrors)
      await trackEvent('file_upload_error', {
        eventName: 'File Upload Error',
        properties: {
          errors: newErrors,
          fileCount: newFiles.length
        }
      })
    }

    setFiles(prev => multiple ? [...prev, ...validFiles] : validFiles)

    // Track file selection
    await trackActivity('file_selected', {
      action: 'File Selected',
      resourceType: 'file',
      metadata: {
        fileCount: validFiles.length,
        totalSize: validFiles.reduce((sum, f) => sum + f.size, 0),
        fileTypes: validFiles.map(f => f.type)
      }
    })

    if (autoProcess && validFiles.length > 0) {
      await uploadFiles(validFiles)
    }
  }

  const uploadFiles = async (filesToUpload) => {
    try {
      setUploading(true)
      const uploadedFiles = []

      for (const file of filesToUpload) {
        try {
          // Create unique file name
          const timestamp = Date.now()
          const uniqueName = `${timestamp}_${file.name}`
          const path = `${storageFolder}/${uniqueName}`

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

          uploadedFiles.push({
            name: file.name,
            size: file.size,
            type: file.type,
            path: path,
            url: urlData.publicUrl,
            uploadedAt: new Date().toISOString()
          })

          // Update progress
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: 100
          }))

          // Track file upload
          await trackActivity('file_uploaded', {
            action: 'File Uploaded',
            resourceType: 'file',
            metadata: {
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              storagePath: path,
              publicUrl: urlData.publicUrl
            }
          })

          onProgress({ fileName: file.name, progress: 100 })
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error)
          setErrors(prev => [...prev, `Failed to upload ${file.name}: ${error.message}`])

          await trackEvent('file_upload_failed', {
            eventName: 'File Upload Failed',
            properties: {
              fileName: file.name,
              error: error.message
            }
          })
        }
      }

      // Call callback with uploaded files
      if (uploadedFiles.length > 0) {
        onFileUpload(uploadedFiles)

        // Track successful upload
        await trackActivity('file_upload_complete', {
          action: 'Files Uploaded Successfully',
          resourceType: 'file',
          metadata: {
            fileCount: uploadedFiles.length,
            totalSize: uploadedFiles.reduce((sum, f) => sum + f.size, 0)
          }
        })
      }

      // Clear files after upload
      setFiles([])
      setUploadProgress({})
    } catch (error) {
      console.error('Upload error:', error)
      setErrors([`Upload failed: ${error.message}`])
    } finally {
      setUploading(false)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e) => {
    const selectedFiles = Array.from(e.target.files || [])
    handleFiles(selectedFiles)
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase()
    const iconMap = {
      pdf: 'picture_as_pdf',
      txt: 'text_snippet',
      doc: 'description',
      docx: 'description',
      jpg: 'image',
      jpeg: 'image',
      png: 'image',
      gif: 'image'
    }
    return iconMap[extension] || 'attachment'
  }

  return (
    <div className="w-full">
      {/* Drop Zone */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        animate={{
          borderColor: isDragging ? '#36e27b' : '#29382f',
          backgroundColor: isDragging ? 'rgba(54, 226, 123, 0.05)' : 'rgba(255, 255, 255, 0)'
        }}
        transition={{ duration: 0.2 }}
        className="relative border-2 border-dashed border-border-dark rounded-2xl p-8 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-4">
          <motion.div
            animate={{ scale: isDragging ? 1.2 : 1 }}
            className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-3xl text-primary">cloud_upload</span>
          </motion.div>

          <div className="text-center">
            <h3 className="text-white font-bold text-lg mb-2">
              {isDragging ? 'Drop files here' : 'Drag files here or click to upload'}
            </h3>
            <p className="text-text-secondary text-sm mb-3">
              Accepted formats: {acceptedTypes.join(', ')}
            </p>
            <p className="text-text-secondary text-xs">
              Maximum file size: {maxSize}MB
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-primary hover:bg-primary-hover text-background-dark font-bold rounded-lg transition-colors"
          >
            Choose Files
          </motion.button>
        </div>
      </motion.div>

      {/* Error Messages */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
          >
            {errors.map((error, index) => (
              <p key={index} className="text-red-400 text-sm mb-1 last:mb-0">
                • {error}
              </p>
            ))}
            <button
              onClick={() => setErrors([])}
              className="mt-2 text-xs text-red-400 hover:text-red-300"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-6 space-y-3"
          >
            <h4 className="text-white font-bold text-sm">Selected Files ({files.length})</h4>
            {files.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-4 p-4 bg-surface-dark border border-border-dark rounded-lg"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-lg">
                    {getFileIcon(file.name)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{file.name}</p>
                  <p className="text-text-secondary text-xs">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                {/* Progress Bar */}
                {uploadProgress[file.name] !== undefined && (
                  <div className="flex-1 min-w-0">
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress[file.name]}%` }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </div>
                )}

                {uploading && uploadProgress[file.name] === undefined ? (
                  <span className="material-symbols-outlined text-primary animate-spin text-lg flex-shrink-0">
                    progress_activity
                  </span>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                    className="w-6 h-6 rounded-full hover:bg-red-500/20 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </motion.button>
                )}
              </motion.div>
            ))}

            {/* Upload Button */}
            {!autoProcess && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => uploadFiles(files)}
                disabled={uploading || files.length === 0}
                className="w-full px-6 py-3 bg-primary hover:bg-primary-hover text-background-dark font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Uploading...
                  </span>
                ) : (
                  'Upload Files'
                )}
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
