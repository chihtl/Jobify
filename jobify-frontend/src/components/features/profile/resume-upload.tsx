'use client';

import {
  Button,
  Modal,
  ModalContent
} from '@/components/ui';
import { useMutation } from '@/hooks/use-api';
import { usersApi } from '@/lib/api';
import { User } from '@/lib/types';
import {
  AlertCircle,
  Check,
  Download,
  Eye,
  FileText,
  Upload,
  X
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ResumeUploadProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSuccess: () => void;
}

const ResumeUpload = ({ isOpen, onClose, user, onSuccess }: ResumeUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const { mutate: uploadResume, loading: isUploading } = useMutation(
    (file: File) => usersApi.uploadResume(user._id, file),
    {
      onSuccess: (response) => {
        // Update user's resumeUrl after successful upload
        const resumeUrl = response.fileUrl;
        usersApi.updateUser(user._id, { resumeUrl }).then(() => {
          toast.success('Tải lên CV thành công!');
          onSuccess();
          handleClose();
        }).catch(() => {
          toast.error('Có lỗi xảy ra khi cập nhật thông tin CV.');
        });
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tải lên CV. Vui lòng thử lại.';
        toast.error(errorMessage);
      }
    }
  );

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ chấp nhận file PDF, DOC, DOCX');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn file CV');
      return;
    }

    // Upload file directly
    uploadResume(selectedFile);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setDragActive(false);
    onClose();
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    return '📄';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Modal title="Tải lên CV" isOpen={isOpen} onClose={handleClose} size="md">
      <ModalContent>
        <div className="space-y-6">
          {/* Current Resume */}
          {user.resumeUrl && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">CV hiện tại</h4>
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900">CV đã tải lên</p>
                  <p className="text-sm text-blue-700">
                    Cập nhật lần cuối: {new Date(user.updatedAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(user.resumeUrl, '_blank')}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = user.resumeUrl!;
                      link.download = 'cv.pdf';
                      link.click();
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
              ? 'border-blue-500 bg-blue-50'
              : selectedFile
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
              }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-4xl">{getFileIcon(selectedFile.type)}</span>
                  <div className="text-left">
                    <p className="font-medium text-green-900">{selectedFile.name}</p>
                    <p className="text-sm text-green-700">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <button
                    onClick={removeFile}
                    className="p-1 hover:bg-red-100 rounded-full text-red-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-green-600">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">File đã sẵn sàng để tải lên</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900 mb-1">
                    Kéo thả file CV hoặc click để chọn
                  </p>
                  <p className="text-sm text-gray-600">
                    Hỗ trợ: PDF, DOC, DOCX (tối đa 5MB)
                  </p>
                </div>

                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload">
                  <Button type="button" variant="outline" className="cursor-pointer" onClick={() => {
                    document.getElementById('resume-upload')?.click()
                  }}>
                    Chọn file CV
                  </Button>
                </label>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-800 mb-1">
                  Lời khuyên cho CV hiệu quả
                </h4>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>• Sử dụng định dạng PDF để đảm bảo hiển thị đúng</li>
                  <li>• Đặt tên file rõ ràng (VD: HoTen_CV.pdf)</li>
                  <li>• Cập nhật thông tin liên hệ và kinh nghiệm mới nhất</li>
                  <li>• Kiểm tra chính tả và ngữ pháp trước khi tải lên</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedFile || isUploading}
              loading={isUploading}
            >
              {isUploading ? 'Đang tải lên...' : 'Tải lên CV'}
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default ResumeUpload;