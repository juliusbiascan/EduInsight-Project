import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Input, Card, Collapse, Layout, Typography, Space, List, Divider, Modal, Select, Upload, Tag, Empty } from 'antd';
import { LeftOutlined, SearchOutlined, PlusOutlined, SettingOutlined, EyeOutlined, ExclamationCircleOutlined, CheckCircleOutlined, MinusCircleOutlined, EditOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import { Quiz, QuizQuestion, Subject } from '@prisma/client';
import { questionTypes, QuestionType } from '@/renderer/types/quiz';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;
const { Panel } = Collapse;

const QuizManager: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { quizId, user } = state || {};

  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [quiz, setQuiz] = useState<(Quiz & { questions: QuizQuestion[] }) | null>(null);
  const [quizSettings, setQuizSettings] = useState<Partial<Quiz>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const [publishModalVisible, setPublishModalVisible] = useState(false);
  const [tempQuizSettings, setTempQuizSettings] = useState<Partial<Quiz>>({});
  const [isDraft, setIsDraft] = useState(false);
  const [searchQuestionTerm, setSearchQuestionTerm] = useState('');


  useEffect(() => {
    const fetchQuiz = async () => {
      if (quizId) {
        const fetchedQuiz = await api.database.getQuizById(quizId);
        setQuiz(fetchedQuiz[0]);
        setQuizSettings(fetchedQuiz[0]);
      }
    };
    fetchQuiz();
  }, [quizId, location.state]);

  const handleSettingChange = (key: string, value: string) => {
    setTempQuizSettings(prev => ({ ...prev, [key]: value }));
  };

  const showSettings = () => {
    setTempQuizSettings(quizSettings);
    setIsSettingsVisible(true);
  };

  const handleSettingsCancel = () => {
    setIsSettingsVisible(false);
    setTempQuizSettings({});
  };

  const handleSettingsSave = async () => {
    if (quizId && quiz) {
      try {
        const updatedFields = {
          title: tempQuizSettings.title,
          grade: tempQuizSettings.grade,
          visibility: tempQuizSettings.visibility,
          color: tempQuizSettings.color
        };

        const updatedQuiz = await api.database.updateQuiz(quizId, updatedFields);
        setQuiz({ ...quiz, ...updatedQuiz });
        setQuizSettings(prevSettings => ({ ...prevSettings, ...updatedFields }));
        setIsSettingsVisible(false);
        Modal.success({
          title: 'Quiz Updated',
          content: 'Quiz settings have been successfully updated.',
        });
      } catch (error) {
        console.error('Error updating quiz:', error);
        Modal.error({
          title: 'Update Failed',
          content: 'An error occurred while updating the quiz settings. Please try again.',
        });
      }
    }
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
    navigate('/quiz-questions', { state: { questionType, quizSettings, quizId } });
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

  const handlePublish = () => {
    if (!quizSettings.grade || !quizSettings.visibility) {
      Modal.error({
        title: 'Incomplete Quiz Settings',
        content: 'Please ensure you have set the grade and visibility for this quiz before publishing.',
      });
      return;
    }

    if (!quiz?.questions || quiz.questions.length === 0) {
      Modal.error({
        title: 'No Questions Added',
        content: 'Please add at least one question to the quiz before publishing.',
      });
      return;
    }

    setPublishModalVisible(true);
  };

  const confirmPublish = async () => {
    try {
      // Implement the actual publish logic here
      await api.database.publishQuiz(quizId);
      Modal.success({
        title: 'Quiz Published',
        content: 'Your quiz has been successfully published!',
      });
      setPublishModalVisible(false);
    } catch (error) {
      Modal.error({
        title: 'Publish Failed',
        content: 'An error occurred while publishing the quiz. Please try again.',
      });
    }
  };

  const handleAddQuestion = () => {
    navigate('/quiz-questions', { state: { quizSettings, quizId } });
  };

  const handleCreateDraft = async () => {
    try {
      // const draftQuiz = await api.database.createDraftFromPublishedQuiz(quizId);
      // setQuiz(draftQuiz);
      setIsDraft(true);
      Modal.success({
        title: 'Draft Created',
        content: 'A draft version of this quiz has been created. You can now edit it without affecting the published version.',
      });
    } catch (error) {
      console.error('Error creating draft:', error);
      Modal.error({
        title: 'Draft Creation Failed',
        content: 'An error occurred while creating a draft of this quiz. Please try again.',
      });
    }
  };

  const filteredQuestions = useMemo(() => {
    if (!quiz?.questions) return [];
    return quiz.questions.filter(q =>
      q.question.toLowerCase().includes(searchQuestionTerm.toLowerCase())
    );
  }, [quiz?.questions, searchQuestionTerm]);

  const handleEditQuestion = (question: QuizQuestion) => {
    navigate('/quiz-questions', {
      state: {
        quizSettings,
        quizId,
        editingQuestion: question,
        questionType: questionTypes.find(type => type.label === question.type)
      }
    });
  };

  const handleDeleteQuestion = async (questionId: string) => {
    Modal.confirm({
      title: 'Delete Question',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this question? This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await api.database.deleteQuizQuestion(questionId);
          setQuiz(prevQuiz => {
            if (!prevQuiz) return null;
            return {
              ...prevQuiz,
              questions: prevQuiz.questions.filter(q => q.id !== questionId)
            };
          });
          Modal.success({
            title: 'Question Deleted',
            content: 'The question has been successfully deleted from the quiz.',
          });
        } catch (error) {
          console.error('Error deleting question:', error);
          Modal.error({
            title: 'Delete Failed',
            content: 'An error occurred while deleting the question. Please try again.',
          });
        }
      },
    });
  };

  return (
    <>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
            <Space>
              <Button icon={<LeftOutlined />} onClick={handleBack} style={{ marginRight: '10px' }}>Back</Button>
              <Text strong style={{ cursor: 'pointer' }} onClick={showSettings}>
                {quiz?.title || 'Untitled Quiz'}
                {isDraft && <Tag color="orange" style={{ marginLeft: '8px' }}>Draft</Tag>}
              </Text>
            </Space>
            <Space>
              <Button icon={<SettingOutlined />} onClick={showSettings}>Settings</Button>
              <Button icon={<EyeOutlined />} disabled={!quiz?.questions || quiz.questions.length === 0}>Preview</Button>
              {quiz?.published && !isDraft ? (
                <Button icon={<CopyOutlined />} onClick={handleCreateDraft}>Create Draft</Button>
              ) : (
                <Button type="primary" onClick={handlePublish}>Publish</Button>
              )}
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
                    value={searchQuestionTerm}
                    onChange={(e) => setSearchQuestionTerm(e.target.value)}
                    onSearch={(value) => setSearchQuestionTerm(value)}
                  />
                </Card>
                <Card>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Text strong>{quiz?.questions.length || 0} question{(quiz?.questions.length || 0) !== 1 && 's'} ({totalPoints} points)</Text>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddQuestion}>Add question</Button>
                  </Space>
                </Card>
                {filteredQuestions.length > 0 ? (
                  <List
                    itemLayout="vertical"
                    dataSource={filteredQuestions}
                    renderItem={q => (
                      <Card
                        key={q.id}
                        style={{ marginBottom: 16 }}
                        actions={[
                          <Button key="edit" icon={<EditOutlined />} onClick={() => handleEditQuestion(q)}>Edit</Button>,
                          <Button key="delete" icon={<DeleteOutlined />} danger onClick={() => handleDeleteQuestion(q.id)}>Delete</Button>
                        ]}
                      >
                        <Card.Meta
                          title={
                            <Space>
                              <Tag color="blue">{q.type}</Tag>
                              <Text type="secondary">{q.time} seconds • {q.points} point{q.points !== 1 && 's'}</Text>
                            </Space>
                          }
                          description={
                            <Space direction="vertical" style={{ width: '100%' }}>
                              <Text strong>{q.question}</Text>
                              <Divider orientation="left">Options</Divider>
                              <List
                                dataSource={JSON.parse(q.options as string)}
                                renderItem={(option: { text: string; isCorrect: boolean }) => (
                                  <List.Item>
                                    <Space>
                                      {option.isCorrect ?
                                        <CheckCircleOutlined style={{ color: '#52c41a' }} /> :
                                        <MinusCircleOutlined style={{ color: '#ff4d4f' }} />
                                      }
                                      <Text>{option.text}</Text>
                                    </Space>
                                  </List.Item>
                                )}
                              />
                            </Space>
                          }
                        />
                      </Card>
                    )}
                    footer={
                      <Button
                        type="dashed"
                        onClick={handleAddQuestion}
                        icon={<PlusOutlined />}
                        style={{ width: '100%' }}
                      >
                        Add question
                      </Button>
                    }
                  />
                ) : (
                  <Card>
                    <Empty
                      description={
                        <span>
                          No questions found matching "{searchQuestionTerm}"
                        </span>
                      }
                    />
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
          <Button key="cancel" onClick={handleSettingsCancel}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={handleSettingsSave}>
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
                value={tempQuizSettings.title}
                onChange={(e) => handleSettingChange('title', e.target.value)}
                maxLength={64}
                showCount
              />
              {(tempQuizSettings.title?.length || 0) < 4 && (
                <Typography.Text type="danger">Name should be at least 4 characters long</Typography.Text>
              )}
            </div>
            {/* Subject picker removed */}
            <div style={{ marginBottom: '16px' }}>
              <Typography.Text strong>Grade</Typography.Text>
              <Select
                style={{ width: '100%' }}
                value={tempQuizSettings.grade}
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
                value={tempQuizSettings.visibility}
                onChange={(value) => handleSettingChange('visibility', value)}
              >
                <Select.Option value="Publicly visible">Publicly visible</Select.Option>
                {/* Add more visibility options */}
              </Select>
            </div>
          </div>
          <div style={{ width: '180px' }}>
            <Typography.Text strong>Quiz Color</Typography.Text>
            <div style={{ marginTop: '8px' }}>
              <Input
                type="color"
                value={tempQuizSettings.color || '#1890ff'} // Default color
                onChange={(e) => handleSettingChange('color', e.target.value)}
                style={{ width: '100%', height: '40px' }}
              />
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        title="Confirm Publish"
        visible={publishModalVisible}
        onCancel={() => setPublishModalVisible(false)}
        onOk={confirmPublish}
        okText="Publish"
        cancelText="Cancel"
      >
        <p>Are you sure you want to publish this quiz?</p>
        <p>Once published, it will be available to students based on the visibility settings.</p>
        <p><ExclamationCircleOutlined style={{ color: '#faad14', marginRight: '8px' }} /> This action cannot be undone.</p>
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