import React, { useState, useMemo } from 'react';
import { Input, Button, Card, Typography, Modal, Select, Upload } from 'antd';
import { LeftOutlined, SettingOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface QuestionType {
  icon: React.ReactNode;
  label: string;
  category: 'basic' | 'openEnded' | 'interactive' | 'math';
}

const questionTypes: QuestionType[] = [
  { icon: '✅', label: 'Multiple Choice', category: 'basic' },
  { icon: '➖', label: 'Fill in the Blank', category: 'basic' },
  { icon: '📝', label: 'Comprehension', category: 'basic' },
  { icon: '🎨', label: 'Draw', category: 'openEnded' },
  { icon: '🎥', label: 'Video Response', category: 'openEnded' },
  { icon: '🔊', label: 'Audio Response', category: 'openEnded' },
  { icon: '📊', label: 'Poll', category: 'openEnded' },
  { icon: '☁️', label: 'Word Cloud', category: 'openEnded' },
  { icon: '🔗', label: 'Match', category: 'interactive' },
  { icon: '🔄', label: 'Reorder', category: 'interactive' },
  { icon: '🔀', label: 'Drag and Drop', category: 'interactive' },
  { icon: '⬇️', label: 'Drop Down', category: 'interactive' },
  { icon: '🎯', label: 'Hotspot', category: 'interactive' },
  { icon: '🏷️', label: 'Labeling', category: 'interactive' },
  { icon: '📊', label: 'Categorize', category: 'interactive' },
  { icon: '🧮', label: 'Math Response', category: 'math' },
  { icon: '📈', label: 'Graphing', category: 'math' },
];

export { questionTypes };

const CreateQuiz: React.FC = () => {
  const [topicName, setTopicName] = useState('Untitled Quiz');
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const navigate = useNavigate();
  const [quizSettings, setQuizSettings] = useState({
    name: 'Untitled Quiz',
    subject: '',
    grade: '',
    language: 'English',
    visibility: 'Publicly visible',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const handleSettingChange = (key: string, value: string) => {
    setQuizSettings(prev => ({ ...prev, [key]: value }));
  };

  const filteredQuestionTypes = useMemo(() => {
    return questionTypes.filter(type =>
      type.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleQuestionTypeClick = (questionType: QuestionType) => {
    navigate('/quiz-questions', { state: { questionType } });
  };

  const renderQuestionTypes = (category: string) => {
    const filteredTypes = filteredQuestionTypes.filter(type => type.category === category);

    if (filteredTypes.length === 0) {
      return null; // Return null if no items left after filtering
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

  const showSettings = () => {
    setIsSettingsVisible(true);
  };

  const handleSettingsCancel = () => {
    setIsSettingsVisible(false);
  };

  const handleBack = () => {
    navigate('/'); // Navigate to the root
  };

  return (
    <div>
      <div style={{
        padding: '10px 20px',
        background: '#f0f2f5',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button icon={<LeftOutlined />} onClick={handleBack} style={{ marginRight: '10px' }}>Back</Button>
          <Text strong style={{ cursor: 'pointer' }} onClick={showSettings}>{topicName}</Text>
        </div>
        <div>
          <Button icon={<SettingOutlined />} onClick={showSettings} style={{ marginRight: '10px' }}>Settings</Button>
          <Button style={{ marginRight: '10px' }}>Preview</Button>
          <Button type="primary">Publish</Button>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        <Title level={3}>Add a new question</Title>
        <Input
          placeholder="Search questions"
          style={{ marginBottom: '20px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {['basic', 'openEnded', 'interactive', 'math'].map(category => {
          const content = renderQuestionTypes(category);
          if (!content) return null; // Don't render the card if there's no content

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
      </div>

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
                value={quizSettings.name}
                onChange={(e) => handleSettingChange('name', e.target.value)}
                maxLength={64}
                showCount
              />
              {quizSettings.name.length < 4 && (
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
                {/* Add subject options here */}
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
            <div style={{ marginBottom: '16px' }}>
              <Typography.Text strong>Language</Typography.Text>
              <Select
                style={{ width: '100%' }}
                value={quizSettings.language}
                onChange={(value) => handleSettingChange('language', value)}
              >
                <Select.Option value="English">English</Select.Option>
                {/* Add more language options */}
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
    </div>
  );
};

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

export default CreateQuiz;