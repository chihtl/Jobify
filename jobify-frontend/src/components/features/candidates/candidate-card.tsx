'use client';

import { Avatar, Badge, Card } from '@/components/ui';
import { API_BASE_URL } from '@/lib/api';
import { User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  Briefcase, 
  Calendar, 
  Download, 
  Mail, 
  MapPin, 
  Phone,
  Star,
  User as UserIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface CandidateCardProps {
  candidate: User;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

const CandidateCard = ({ 
  candidate, 
  isSelected = false, 
  onClick, 
  className 
}: CandidateCardProps) => {
  const handleClick = () => {
    onClick?.();
  };

  const formatDate = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { 
        addSuffix: true, 
        locale: vi 
      });
    } catch {
      return '';
    }
  };

  const getLatestExperience = () => {
    if (!candidate.experiences?.length) return null;
    
    // Sort by start date and get the most recent
    const sorted = [...candidate.experiences].sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      return dateB.getTime() - dateA.getTime();
    });
    
    return sorted[0];
  };

  const latestExperience = getLatestExperience();

  return (
    <Card
      className={cn(
        'p-6 cursor-pointer transition-all duration-200 hover:shadow-lg border-l-4',
        isSelected 
          ? 'border-l-blue-500 bg-blue-50 shadow-md' 
          : 'border-l-transparent hover:border-l-blue-300',
        className
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Avatar
          src={candidate.avatarUrl ? `${API_BASE_URL}${candidate.avatarUrl}` : undefined}
          name={candidate.name}
          size="lg"
          className="flex-shrink-0"
        />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {candidate.name}
              </h3>
              
              {latestExperience && (
                <p className="text-sm text-gray-600 mt-1">
                  {latestExperience.title} tại {latestExperience.company}
                </p>
              )}
            </div>

            {/* Score (if from vector search) */}
            {(candidate as any).score && (
              <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                <Star className="w-3 h-3" />
                {Math.round((candidate as any).score * 100)}%
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
            {candidate.email && (
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span className="truncate">{candidate.email}</span>
              </div>
            )}
            
            {candidate.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <span>{candidate.phone}</span>
              </div>
            )}
            
            {candidate.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{candidate.location}</span>
              </div>
            )}
          </div>

          {/* Bio */}
          {candidate.bio && (
            <p className="text-sm text-gray-700 mb-3 line-clamp-2">
              {candidate.bio}
            </p>
          )}

          {/* Experience Summary */}
          {candidate.experiences && candidate.experiences.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <Briefcase className="w-4 h-4" />
              <span>{candidate.experiences.length} kinh nghiệm làm việc</span>
            </div>
          )}

          {/* Skills */}
          {candidate.skillIds && candidate.skillIds.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {candidate.skillIds.slice(0, 3).map((skillId, index) => (
                <Badge key={skillId} variant="secondary" className="text-xs">
                  Skill {index + 1}
                </Badge>
              ))}
              {candidate.skillIds.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{candidate.skillIds.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>Cập nhật {formatDate(candidate.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CandidateCard;
