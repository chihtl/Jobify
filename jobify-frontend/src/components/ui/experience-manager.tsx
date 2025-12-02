'use client';

import { Experience } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Calendar, MapPin, Plus, Trash2, Building } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from './button';
import { Modal, ModalContent } from './modal';

interface ExperienceManagerProps {
  experiences: Experience[];
  onChange: (experiences: Experience[]) => void;
  label?: string;
  error?: string;
  className?: string;
}

interface ExperienceFormData {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

const ExperienceManager = React.forwardRef<HTMLDivElement, ExperienceManagerProps>(
  ({ experiences = [], onChange, label, error, className }, ref) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [formData, setFormData] = useState<ExperienceFormData>({
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    });

    const resetForm = () => {
      setFormData({
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      });
      setEditingIndex(null);
    };

    const handleAdd = () => {
      resetForm();
      setIsModalOpen(true);
    };

    const handleEdit = (index: number) => {
      const exp = experiences[index];
      setFormData({
        title: exp.title || '',
        company: exp.company || '',
        location: exp.location || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        current: exp.current || false,
        description: exp.description || '',
      });
      setEditingIndex(index);
      setIsModalOpen(true);
    };

    const handleDelete = (index: number) => {
      const newExperiences = experiences.filter((_, i) => i !== index);
      onChange(newExperiences);
    };

    const handleSave = () => {
      if (!formData.title.trim() || !formData.company.trim() || !formData.startDate) {
        return;
      }

      const newExperience: Experience = {
        title: formData.title.trim(),
        company: formData.company.trim(),
        location: formData.location.trim() || undefined,
        startDate: formData.startDate,
        endDate: formData.current ? undefined : formData.endDate || undefined,
        current: formData.current,
        description: formData.description.trim() || undefined,
      };

      let newExperiences: Experience[];
      if (editingIndex !== null) {
        newExperiences = [...experiences];
        newExperiences[editingIndex] = newExperience;
      } else {
        newExperiences = [...experiences, newExperience];
      }

      onChange(newExperiences);
      setIsModalOpen(false);
      resetForm();
    };

    const handleCancel = () => {
      setIsModalOpen(false);
      resetForm();
    };

    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const [year, month] = dateStr.split('-');
      return `${month}/${year}`;
    };

    const isFormValid = formData.title.trim() && formData.company.trim() && formData.startDate;

    return (
      <div className={cn('space-y-2', className)} ref={ref}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}

        <div className="space-y-3">
          {experiences.map((exp, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Building className="w-4 h-4" />
                    <span>{exp.company}</span>
                    {exp.location && (
                      <>
                        <span>•</span>
                        <MapPin className="w-4 h-4" />
                        <span>{exp.location}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(exp.startDate)} - {exp.current ? 'Hiện tại' : formatDate(exp.endDate || '')}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                      {exp.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(index)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Sửa
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={handleAdd}
            className="w-full border-dashed border-2 border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm kinh nghiệm làm việc
          </Button>
        </div>

        {error && (
          <p className="text-sm text-red-600 mt-1">
            {error}
          </p>
        )}

        {/* Experience Form Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCancel}
          title={editingIndex !== null ? 'Chỉnh sửa kinh nghiệm' : 'Thêm kinh nghiệm làm việc'}
          size="lg"
        >
          <ModalContent>
            <form className="space-y-4">
              {/* Job Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vị trí công việc *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ví dụ: Senior Software Engineer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Công ty *
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Ví dụ: Google"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa điểm
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ví dụ: Hà Nội, Việt Nam"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày bắt đầu *
                  </label>
                  <input
                    type="month"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày kết thúc
                  </label>
                  <input
                    type="month"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    disabled={formData.current}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Current Job Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="current"
                  checked={formData.current}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    current: e.target.checked,
                    endDate: e.target.checked ? '' : formData.endDate
                  })}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="current" className="ml-2 text-sm text-gray-700">
                  Tôi hiện đang làm việc ở đây
                </label>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả công việc
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Mô tả về trách nhiệm, thành tích và kỹ năng đã học được..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                >
                  Hủy
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={!isFormValid}
                >
                  {editingIndex !== null ? 'Cập nhật' : 'Thêm'}
                </Button>
              </div>
            </form>
          </ModalContent>
        </Modal>
      </div>
    );
  }
);

ExperienceManager.displayName = 'ExperienceManager';

export { ExperienceManager };
