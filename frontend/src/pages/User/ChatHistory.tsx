import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Search, MessageSquare } from 'lucide-react';
import { apiClient } from '../../services/api.client';
import { API_ENDPOINTS } from '../../config/api.config';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { ChatSession } from '../../types/api.types';

const ChatHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ sessions: ChatSession[] }>(`${API_ENDPOINTS.CHAT.RECENT}?limit=50`);
      setSessions(response.sessions);
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
      toast.error('Không thể tải lịch sử chat');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: number) => {
    if (!confirm('Bạn có chắc muốn xóa cuộc trò chuyện này?')) return;
    
    try {
      await apiClient.delete(API_ENDPOINTS.CHAT.DELETE_SESSION(sessionId));
      setSessions(sessions.filter(s => s.id !== sessionId));
      toast.success('Đã xóa cuộc trò chuyện');
    } catch {
      toast.error('Không thể xóa cuộc trò chuyện');
    }
  };

  const handleViewSession = (sessionId: number) => {
    navigate(`/user/chat/${sessionId}`);
  };

  const filteredSessions = sessions.filter(session => {
    const searchLower = searchQuery.toLowerCase();
    return (
      session.title?.toLowerCase().includes(searchLower) ||
      session.status?.toLowerCase().includes(searchLower)
    );
  });

  const totalSessions = sessions.length;
  const activeSessions = sessions.filter(s => s.status === 'active').length;
  const completedSessions = sessions.filter(s => s.status === 'completed').length;

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Lịch Sử Chat</h1>
        <p className="text-muted-foreground mt-1">
          Xem lại các cuộc trò chuyện trước đây
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng Buổi Chat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">Tất cả buổi trò chuyện</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đang Hoạt Động
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">Cuộc trò chuyện đang mở</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đã Hoàn Thành
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">Cuộc trò chuyện đã kết thúc</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Chat</CardTitle>
          <CardDescription>Lịch sử các cuộc trò chuyện của bạn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo bác sĩ, tâm trạng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Cập nhật</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Tin nhắn</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.length > 0 ? (
                  filteredSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">
                        {session.title || `Chat #${session.id}`}
                      </TableCell>
                      <TableCell>
                        {new Date(session.created_at).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        {new Date(session.updated_at).toLocaleString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                          {session.status === 'active' ? 'Hoạt động' : 'Đã hoàn thành'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-muted-foreground" />
                          {session.message_count}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewSession(session.id)}>
                            Xem chi tiết
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteSession(session.id)}>
                            Xóa
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {sessions.length === 0 ? 'Chưa có cuộc trò chuyện nào' : 'Không tìm thấy kết quả phù hợp'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatHistory;
