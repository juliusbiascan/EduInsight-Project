import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Input, Card, Collapse, Layout, Typography, Space, List, Divider, Modal, Select, Upload, Empty } from 'antd';
import { LeftOutlined, SearchOutlined, PlusOutlined, SettingOutlined, EyeOutlined } from '@ant-design/icons';
import { Quiz, QuizQuestion } from '@prisma/client';
import { questionTypes, QuestionType } from '@/renderer/types/quiz';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Panel } = Collapse;

const QuizManager: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { quizId } = state || {};
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [quiz, setQuiz] = useState<(Quiz & { questions: QuizQuestion[] }) | null>(null);
  const [quizSettings, setQuizSettings] = useState<Partial<Quiz>>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchQuiz = async () => {
      if (quizId) {
        const fetchedQuiz = await api.database.getQuizById(quizId);
        setQuiz(fetchedQuiz[0]);
        setQuizSettings(fetchedQuiz[0]);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const handleSettingChange = (key: string, value: string) => {
    setQuizSettings(prev => ({ ...prev, [key]: value }));
  };

  const showSettings = () => {
    setIsSettingsVisible(true);
  };

  const handleSettingsCancel = () => {
    setIsSettingsVisible(false);
  };

  const handleBack = () => {
    navigate("/");
  };

  const totalPoints = quiz?.questions.reduce((sum, q) => sum + (q.points || 0), 0) || 0;

  const filteredQuestionTypes = useMemo(() => {
    return questionTypes.filter(type =>
      type.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleQuestionTypeClick = (questionType: QuestionType) => {
    // Navigate to question creation page or handle question creation logic
    console.log('Creating question of type:', questionType.label);
    navigate('/quiz-questions', { state: { questionType, quizSettings } });
  };

  const renderQuestionTypes = (category: string) => {
    const filteredTypes = filteredQuestionTypes.filter(type => type.category === category);

    if (filteredTypes.length === 0) {
      return null;
    }

    return filteredTypes.map(type => (
      <Button
        key={type.label}
        icon={type.icon}
        style={{ margin: '5px' }}
        onClick={() => handleQuestionTypeClick(type)}
      >
        {type.label}
      </Button>
    ));
  };

  return (
    <>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
            <Space>
              <Button icon={<LeftOutlined />} onClick={handleBack} style={{ marginRight: '10px' }}>Back</Button>
              <Text strong style={{ cursor: 'pointer' }} onClick={showSettings}>{quiz?.title || 'Untitled Quiz'}</Text>
            </Space>
            <Space>
              <Button icon={<SettingOutlined />} onClick={showSettings}>Settings</Button>
              <Button icon={<EyeOutlined />}>Preview</Button>
              <Button type="primary">Publish</Button>
            </Space>
          </div>
        </Header>
        {quiz?.questions && quiz.questions.length > 0 ? (
          <Layout>
            <Sider width={300} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
              <Card title="Bulk update questions" style={{ margin: 16 }}>
                <Collapse bordered={false}>
                  <Panel header="Time" key="time">
                    {/* Time options */}
                  </Panel>
                  <Panel header="Points" key="points">
                    {/* Points options */}
                  </Panel>
                </Collapse>
              </Card>
              <Divider style={{ margin: '8px 0' }} />
              <Card title="Import from" style={{ margin: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button block>Google Forms</Button>
                  <Button block>Spreadsheet</Button>
                </Space>
              </Card>
            </Sider>
            <Content style={{ padding: '24px', backgroundColor: '#f5f5f5' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Card>
                  <Input.Search
                    placeholder="Search questions"
                    enterButton={<Button icon={<SearchOutlined />}>Search</Button>}
                    size="large"
                  />
                </Card>
                <Card>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Text strong>{quiz?.questions.length || 0} question{(quiz?.questions.length || 0) !== 1 && 's'} ({totalPoints} points)</Text>
                  </Space>
                </Card>
                {quiz?.questions && quiz.questions.length > 0 ? (
                  <List
                    itemLayout="vertical"
                    dataSource={quiz.questions}
                    renderItem={q => (
                      <List.Item
                        key={q.id}
                        actions={[
                          <Button key="edit" type="link">Edit</Button>,
                          <Button key="delete" type="link" danger>Delete</Button>
                        ]}
                        style={{ backgroundColor: '#fff', marginBottom: 16, padding: 16, borderRadius: 8 }}
                      >
                        <List.Item.Meta
                          title={<Text strong style={{ fontSize: 18 }}>{q.type}</Text>}
                          description={
                            <Space direction="vertical" style={{ width: '100%' }}>
                              <Text type="secondary">{q.time} • {q.points} point{q.points !== 1 && 's'}</Text>
                              <Text strong>{q.question}</Text>
                              <Text type="secondary">Answer: {q.answer}</Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Card title="Add a new question">
                    <Input
                      placeholder="Search questions"
                      style={{ marginBottom: '20px' }}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {['basic', 'openEnded', 'interactive', 'math'].map(category => {
                      const content = renderQuestionTypes(category);
                      if (!content) return null;

                      return (
                        <Card
                          key={category}
                          title={getCategoryTitle(category)}
                          style={{ marginBottom: '20px' }}
                        >
                          {content}
                        </Card>
                      );
                    })}
                  </Card>
                )}
              </Space>
            </Content>
          </Layout>
        ) : (
          <Content style={{ padding: '24px', backgroundColor: '#f5f5f5' }}>
            <Card title="Add a new question">
              <Input
                placeholder="Search questions"
                style={{ marginBottom: '20px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {['basic', 'openEnded', 'interactive', 'math'].map(category => {
                const content = renderQuestionTypes(category);
                if (!content) return null;

                return (
                  <Card
                    key={category}
                    title={getCategoryTitle(category)}
                    style={{ marginBottom: '20px' }}
                  >
                    {content}
                  </Card>
                );
              })}
            </Card>
          </Content>
        )}
      </Layout>
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <SettingOutlined style={{ marginRight: '8px' }} />
            <span>Quiz settings</span>
          </div>
        }
        visible={isSettingsVisible}
        onCancel={handleSettingsCancel}
        footer={[
          <Button key="save" type="primary" onClick={handleSettingsCancel}>
            Save
          </Button>,
        ]}
        width={600}
      >
        <Typography.Paragraph>
          Review quiz settings and you're good to go
        </Typography.Paragraph>
        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: '16px' }}>
              <Typography.Text strong>Name</Typography.Text>
              <Input
                value={quizSettings.title}
                onChange={(e) => handleSettingChange('title', e.target.value)}
                maxLength={64}
                showCount
              />
              {(quizSettings.title?.length || 0) < 4 && (
                <Typography.Text type="danger">Name should be at least 4 characters long</Typography.Text>
              )}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Typography.Text strong>Subject</Typography.Text>
              <Select
                style={{ width: '100%' }}
                placeholder="Select relevant subject"
                value={quizSettings.subject}
                onChange={(value) => handleSettingChange('subject', value)}
              >
                {/* Add subject options dynamically */}
              </Select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Typography.Text strong>Grade</Typography.Text>
              <Select
                style={{ width: '100%' }}
                value={quizSettings.grade}
                onChange={(value) => handleSettingChange('grade', value)}
              >
                <Select.Option value="2nd Grade">2nd Grade</Select.Option>
                {/* Add more grade options */}
              </Select>
            </div>

            <div>
              <Typography.Text strong>Visibility</Typography.Text>
              <Select
                style={{ width: '100%' }}
                value={quizSettings.visibility}
                onChange={(value) => handleSettingChange('visibility', value)}
              >
                <Select.Option value="Publicly visible">Publicly visible</Select.Option>
                {/* Add more visibility options */}
              </Select>
            </div>
          </div>
          <div style={{ width: '180px' }}>
            <Typography.Text strong>Cover Image</Typography.Text>
            <Upload
              listType="picture-card"
              showUploadList={false}
              action="/upload.do" // Replace with your upload endpoint
              style={{ width: '100%', height: '180px', marginTop: '8px' }}
            >
              <div style={{ padding: '16px', textAlign: 'center' }}>
                <PlusOutlined style={{ fontSize: '24px' }} />
                <div style={{ marginTop: '8px' }}>Add cover image</div>
              </div>
            </Upload>
          </div>
        </div>
      </Modal>
    </>
  );
}
// Add this function to get the category title
const getCategoryTitle = (category: string): string => {
  switch (category) {
    case 'basic': return 'Basic Questions';
    case 'openEnded': return 'Open ended responses';
    case 'interactive': return 'Interactive/Higher-order thinking';
    case 'math': return 'Mathematics';
    default: return '';
  }
};
export default QuizManager;