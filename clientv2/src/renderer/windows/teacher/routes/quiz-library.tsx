import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined, MoreOutlined, PlayCircleOutlined, EditOutlined, DeleteOutlined, CloseOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, Tabs, Card, Dropdown, Menu, Typography, Space, Row, Col, Avatar, Modal, Spin } from 'antd';
import { DeviceUser, Quiz, QuizQuestion } from '@prisma/client';
import { Toaster } from '@/renderer/components/ui/toaster';
import { useToast } from '@/renderer/hooks/use-toast';

const { Title, Text } = Typography;

const QuizLibrary: React.FC = () => {
  const [activeTab, setActiveTab] = useState('published');
  const navigate = useNavigate();

  const [user, setUser] = useState<DeviceUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);
  const [publishedQuizzes, setPublishedQuizzes] = useState<(Quiz & { questions: QuizQuestion[] })[]>([]);
  const [draftQuizzes, setDraftQuizzes] = useState<(Quiz & { questions: QuizQuestion[] })[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const devices = await api.database.getDevice();
        if (devices && devices.length > 0) {
          const activeUsers = await api.database.getActiveUserByDeviceId(devices[0].id, devices[0].labId);
          if (activeUsers && activeUsers.length > 0) {
            const users = await api.database.getDeviceUserByActiveUserId(activeUsers[0].userId);
            if (users && users.length > 0) {
              setUser(users[0]);
              const fetchedQuizzes = await api.database.getQuizzesByUserId(users[0].id);
              const published = fetchedQuizzes.filter(quiz => quiz.published);
              const drafts = fetchedQuizzes.filter(quiz => !quiz.published);
              setPublishedQuizzes(published);
              setDraftQuizzes(drafts);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch user data",
          variant: "destructive",
        })
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [toast]);

  const handleDeleteQuiz = async (quiz: Quiz) => {
    setQuizToDelete(quiz);
  };

  const confirmDeleteQuiz = async () => {
    if (quizToDelete) {
      try {
        await api.database.deleteQuiz(quizToDelete.id);
        if (quizToDelete.published) {
          setPublishedQuizzes(publishedQuizzes.filter(q => q.id !== quizToDelete.id));
        } else {
          setDraftQuizzes(draftQuizzes.filter(q => q.id !== quizToDelete.id));
        }
        toast({
          title: "Success",
          description: "Quiz deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting quiz:", error);
        toast({
          title: "Error",
          description: "Failed to delete quiz",
          variant: "destructive",
        });
      } finally {
        setQuizToDelete(null);
      }
    }
  };

  const handleEditQuiz = (quiz: Quiz & { questions: QuizQuestion[] }) => {
    navigate('/quiz-manager', { state: { user, quizId: quiz.id } });
  };

  const renderQuizItem = (quiz: Quiz & { questions: QuizQuestion[] }) => (
    <Card
      key={quiz.id}
      hoverable
      className="mb-4"
      cover={<img alt={quiz.title} src={quiz.image} style={{ height: 200, objectFit: 'cover' }} />}
    >
      <Card.Meta
        title={<Title level={4}>{quiz.title}</Title>}
        description={
          <Space direction="vertical" size="small">
            <Text type="secondary">{quiz.questions.length} Questions • {quiz.grade}</Text>
            <Text type="secondary">{quiz.subject}</Text>
            <Space>
              <Avatar size="small" src="https://via.placeholder.com/150" />
              <Text type="secondary">{quiz.author}</Text>
            </Space>
            <Text type="secondary">{quiz.createdAt.toLocaleDateString()}</Text>
          </Space>
        }
      />
      <Space className="mt-3" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button icon={<PlayCircleOutlined />} type="primary">Play</Button>
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEditQuiz(quiz)}>Edit</Button>
          <Dropdown overlay={
            <Menu>
              <Menu.Item key="delete" icon={<DeleteOutlined />} onClick={() => handleDeleteQuiz(quiz)}>
                Delete
              </Menu.Item>
            </Menu>
          } placement="bottomRight">
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      </Space>
    </Card>
  );

  const handleCreateQuiz = async () => {
    try {
      const untitledQuiz = {
        userId: user?.id || '',
        title: `Untitled Quiz ${Math.floor(Math.random() * 1000)}`,
        grade: "",
        subject: "",
        author: user?.firstName + ' ' + user?.lastName || 'Anonymous',
        image: 'https://via.placeholder.com/300',
        visibility: 'public',
        published: false,
      };

      const createdQuiz = await api.database.createQuiz(untitledQuiz);
      setDraftQuizzes([...draftQuizzes, { ...createdQuiz, questions: [] }]);

      navigate('/quiz-manager', { state: { user, quizId: createdQuiz.id } });

    } catch (error) {
      console.error("Error creating random quiz:", error);
      toast({
        title: "Error",
        description: "Failed to create random quiz",
        variant: "destructive",
      });
    }
  };

  const handleCloseWindow = () => {
    window.close();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2}>My Library</Title>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateQuiz} size="large">
              Create Quiz
            </Button>
            <Button icon={<CloseOutlined />} onClick={handleCloseWindow} size="large" />
          </Space>
        </div>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'published',
              label: `Published (${publishedQuizzes.length})`,
              children: (
                <Row gutter={[16, 16]}>
                  {publishedQuizzes.map(quiz => (
                    <Col xs={24} sm={12} md={8} lg={6} key={quiz.id}>
                      {renderQuizItem(quiz)}
                    </Col>
                  ))}
                </Row>
              ),
            },
            {
              key: 'drafts',
              label: `Drafts (${draftQuizzes.length})`,
              children: (
                <Row gutter={[16, 16]}>
                  {draftQuizzes.map(quiz => (
                    <Col xs={24} sm={12} md={8} lg={6} key={quiz.id}>
                      {renderQuizItem(quiz)}
                    </Col>
                  ))}
                </Row>
              ),
            },
          ]}
        />
      </Space>
      <Modal
        title="Delete Quiz"
        visible={!!quizToDelete}
        onOk={confirmDeleteQuiz}
        onCancel={() => setQuizToDelete(null)}
        okText="Delete"
        cancelText="Cancel"
      >
        <p>Are you sure you want to delete the quiz "{quizToDelete?.title}"? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default QuizLibrary;