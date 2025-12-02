'use client';

import {
  Avatar,
  Button,
  Modal,
  ModalContent,
  ExperienceManager
} from '@/components/ui';
import { MultiSelect } from '@/components/ui/multi-select';
import { useApi, useMutation } from '@/hooks/use-api';
import { usersApi, skillsApi, API_BASE_URL } from '@/lib/api';
import { User, Experience, Skill } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Briefcase,
  Calendar,
  Camera,
  Mail,
  MapPin,
  Phone,
  Plus,
  Trash2,
  User as UserIcon,
  X
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  bio: z.string().max(500, 'Giới thiệu không được vượt quá 500 ký tự').optional().or(z.literal('')),
  skillIds: z.array(z.string()).optional(),
  experiences: z.array(z.object({
    title: z.string(),
    company: z.string(),
    location: z.string().nullish(),
    startDate: z.string(),
    endDate: z.string().nullish(),
    current: z.boolean().nullish(),
    description: z.string().nullish(),
  })).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSuccess: () => void;
}

const ProfileEdit = ({ isOpen, onClose, user, onSuccess }: ProfileEditProps) => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(user.skillIds || []);
  const [experiences, setExperiences] = useState<Experience[]>(user.experiences || []);

  // Fetch skills for the multi-select
  const { data: skills } = useApi(
    () => skillsApi.getSkillsSimple(),
    [],
    { immediate: true }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      location: user.location || '',
      bio: user.bio || '',
      skillIds: user.skillIds || [],
      experiences: user.experiences || [],
    }
  });

  // Update form values when skills or experiences change
  React.useEffect(() => {
    setValue('skillIds', selectedSkills);
  }, [selectedSkills, setValue]);

  React.useEffect(() => {
    // Clean up null values in experiences before setting
    const cleanedExperiences = experiences.map(exp => ({
      ...exp,
      location: exp.location || undefined,
      endDate: exp.endDate || undefined,
      description: exp.description || undefined,
      current: exp.current || false,
    }));
    setValue('experiences', cleanedExperiences);
  }, [experiences, setValue]);

  const { mutate: updateProfile, loading: isUpdating } = useMutation(
    (data: any) => usersApi.updateUser(user._id, data),
    {
      onSuccess: () => {
        toast.success('Cập nhật thông tin thành công!');
        onSuccess();
        handleClose();
      },
      onError: (error: any) => {
        if (error.response?.status === 409) {
          toast.error('Email đã được sử dụng bởi tài khoản khác');
        } else {
          toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
        }
      }
    }
  );

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Chỉ chấp nhận file ảnh (JPG, PNG, GIF)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error('Kích thước ảnh không được vượt quá 5MB');
        return;
      }

      setAvatarFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      console.log('Form data: ', data);
      console.log('Form errors: ', errors);
      
      // First upload avatar if selected
      if (avatarFile) {
        const avatarResponse = await usersApi.uploadAvatar(user._id, avatarFile);
        // Avatar URL is automatically updated in the upload API
      }

      // Then update other profile data
      const updateData: any = { 
        ...data,
        // Ensure we have the latest values
        skillIds: data.skillIds || selectedSkills,
        experiences: data.experiences || experiences
      };

      console.log('Update data: ', updateData);
      
      updateProfile(updateData);
    } catch (error) {
      console.error('Submit error: ', error);
      toast.error('Có lỗi xảy ra khi tải lên ảnh đại diện.');
    }
  };

  const handleClose = () => {
    reset({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      location: user.location || '',
      bio: user.bio || '',
      skillIds: user.skillIds || [],
      experiences: user.experiences || [],
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setSelectedSkills(user.skillIds || []);
    setExperiences(user.experiences || []);
    onClose();
  };

  // Debug handler to check if form submission is working
  const handleFormSubmit = (e: React.FormEvent) => {
    console.log('Form submit event triggered');
    console.log('Current errors:', errors);
    handleSubmit(onSubmit)(e);
  };

  const bioLength = watch('bio')?.length || 0;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl" title="Chỉnh sửa hồ sơ">
      <ModalContent>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="text-center">
            <div className="relative inline-block">
              <Avatar
                src={avatarPreview || (user.avatarUrl ? `${API_BASE_URL}${user.avatarUrl}` : undefined)}
                name={user.name}
                size="xl"
                className="border-4 border-gray-200"
              />

              <div className="absolute bottom-0 right-0 flex gap-1">
                <label className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer shadow-lg">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>

                {(avatarPreview || user.avatarUrl) && (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-2">
              Click vào biểu tượng camera để thay đổi ảnh đại diện
            </p>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên *
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Nguyễn Văn A"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="your@email.com"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('phone')}
                  type="tel"
                  placeholder="0123456789"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Location */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('location')}
                  type="text"
                  placeholder="Hà Nội, Việt Nam"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
              </div>
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
              )}
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giới thiệu bản thân
              </label>
              <textarea
                {...register('bio')}
                rows={4}
                placeholder="Giới thiệu ngắn về bản thân, kinh nghiệm và mục tiêu nghề nghiệp..."
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${errors.bio ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.bio && (
                  <p className="text-red-500 text-sm">{errors.bio.message}</p>
                )}
                <p className={`text-sm ml-auto ${bioLength > 450 ? 'text-red-500' : 'text-gray-500'}`}>
                  {bioLength}/500
                </p>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="space-y-4">
            <MultiSelect
              label="Kỹ năng"
              placeholder="Chọn kỹ năng của bạn..."
              options={skills?.map((skill: Skill) => ({
                value: skill._id,
                label: skill.name
              })) || []}
              value={selectedSkills}
              onChange={setSelectedSkills}
              searchable={true}
              maxDisplayed={5}
            />
          </div>

          {/* Experiences Section */}
          <div className="space-y-4">
            <ExperienceManager
              label="Kinh nghiệm làm việc"
              experiences={experiences}
              onChange={setExperiences}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUpdating}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              loading={isUpdating}
              disabled={isUpdating}
              onClick={(e) => {
                console.log('Button clicked!');
                console.log('Form errors at click:', errors);
                // Let the form handle the submit
              }}
            >
              {isUpdating ? 'Đang cập nhật...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default ProfileEdit;