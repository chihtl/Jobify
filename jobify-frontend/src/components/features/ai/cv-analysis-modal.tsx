'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  X, 
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CVAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    jobDetails: {
      title: string;
      company: string;
      requirements: string[];
      skills: string[];
    };
    analysis: {
      strengths: string[];
      weakness: string[];
      suggests: string[];
    };
    cached: boolean;
    fallback?: boolean;
  } | null;
  loading?: boolean;
}

const CVAnalysisModal = ({ isOpen, onClose, data, loading = false }: CVAnalysisModalProps) => {
  if (!isOpen) return null;

  // Debug logs
  console.log('Modal - loading:', loading);
  console.log('Modal - data:', data);
  console.log('Modal - data exists:', !!data);
  console.log('Modal - data.analysis:', data?.analysis);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Phân tích CV với AI</h2>
                  {data && (
                    <p className="text-blue-100 text-sm">
                      Vị trí: {data.jobDetails?.title} tại {data.jobDetails?.company}
                      {data.cached && <Badge variant="secondary" className="ml-2 text-xs">Đã phân tích</Badge>}
                      {data.fallback && <Badge variant="outline" className="ml-2 text-xs bg-yellow-100 text-yellow-800">Fallback</Badge>}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Đang phân tích CV của bạn...</p>
                  <p className="text-sm text-gray-500 mt-2">AI đang so sánh CV với yêu cầu công việc</p>
                </div>
              </div>
            ) : data ? (
              <div className="space-y-6">
                {/* Strengths */}
                <Card className="border-green-200 bg-green-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <div className="p-1 bg-green-100 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      Điểm mạnh ({data.analysis.strengths.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data.analysis.strengths.length > 0 ? (
                      <div className="space-y-3">
                        {data.analysis.strengths.map((strength, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200"
                          >
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <p className="text-gray-700 leading-relaxed">{strength}</p>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Không tìm thấy điểm mạnh nổi bật</p>
                    )}
                  </CardContent>
                </Card>

                {/* Weaknesses */}
                <Card className="border-red-200 bg-red-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-red-800">
                      <div className="p-1 bg-red-100 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                      Điểm cần cải thiện ({data.analysis.weakness.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data.analysis.weakness.length > 0 ? (
                      <div className="space-y-3">
                        {data.analysis.weakness.map((weakness, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + 0.2 }}
                            className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-200"
                          >
                            <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <p className="text-gray-700 leading-relaxed">{weakness}</p>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Không tìm thấy điểm yếu đáng kể</p>
                    )}
                  </CardContent>
                </Card>

                {/* Suggestions */}
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <div className="p-1 bg-blue-100 rounded-lg">
                        <Target className="w-5 h-5 text-blue-600" />
                      </div>
                      Đề xuất cải thiện ({data.analysis.suggests.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data.analysis.suggests.length > 0 ? (
                      <div className="space-y-3">
                        {data.analysis.suggests.map((suggestion, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + 0.4 }}
                            className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200"
                          >
                            <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-gray-700 leading-relaxed">{suggestion}</p>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Không có đề xuất cụ thể</p>
                    )}
                  </CardContent>
                </Card>

                {/* Job Requirements Summary */}
                <Card className="border-gray-200 bg-gray-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <div className="p-1 bg-gray-100 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-gray-600" />
                      </div>
                      Yêu cầu công việc
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* {data.jobDetails.skills.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Kỹ năng yêu cầu:</h4>
                          <div className="flex flex-wrap gap-2">
                            {data.jobDetails.skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )} */}
                      {data.jobDetails.requirements.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Yêu cầu khác:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            {data.jobDetails.requirements.slice(0, 5).map((req, index) => (
                              <li key={index}>{req}</li>
                            ))}
                            {data.jobDetails.requirements.length > 5 && (
                              <li className="text-gray-500 italic">
                                +{data.jobDetails.requirements.length - 5} yêu cầu khác...
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-600">Không thể tải dữ liệu phân tích</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {data && !loading && (
            <div className="border-t bg-gray-50 px-6 py-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  💡 Tip: Sử dụng các đề xuất để cải thiện CV của bạn
                </div>
                <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CVAnalysisModal;
