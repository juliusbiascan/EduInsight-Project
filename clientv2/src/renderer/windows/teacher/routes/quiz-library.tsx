import React, { useState } from 'react';
import { Button, Tabs, List, Avatar, Space, Dropdown, Menu } from 'antd';
import { PlusOutlined, MoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { TabPane } = Tabs;

interface Quiz {
  id: string;
  title: string;
  questions: number;
  grade: string;
  subject: string;
  author: string;
  date: string;
  image: string;
}

const QuizLibrary: React.FC = () => {
  const [activeTab, setActiveTab] = useState('published');
  const navigate = useNavigate();

  const dummyQuizzes: Quiz[] = [
    {
      id: '1',
      title: 'Using NLP API\'s',
      questions: 1,
      grade: '2nd Grade',
      subject: 'Others',
      author: 'Julius (LZKDEV)',
      date: '6 months ago',
      image: 'path/to/quiz-image.png',
    },
    // Add more dummy quizzes here
  ];

  const renderQuizItem = (quiz: Quiz) => (
    <List.Item
      key={quiz.id}
      actions={[
        <Button type="primary" size="small">Play</Button>,
        <Dropdown overlay={
          <Menu>
            <Menu.Item key="like">Like</Menu.Item>
            <Menu.Item key="save">Save</Menu.Item>
            <Menu.Item key="delete">Delete</Menu.Item>
          </Menu>
        } trigger={['click']}>
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ]}
    >
      <List.Item.Meta
        avatar={<Avatar src={quiz.image} shape="square" size={64} />}
        title={quiz.title}
        description={
          <Space>
            <span>{quiz.questions} Question</span>
            <span>{quiz.grade}</span>
            <span>{quiz.subject}</span>
            <span>{quiz.author} • {quiz.date}</span>
          </Space>
        }
      />
    </List.Item>
  );

  const handleCreateQuiz = () => {
    navigate('/create-quiz');
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h1>My Library</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateQuiz}>Create Quiz</Button>
      </div>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab={`Published (${dummyQuizzes.length})`} key="published">
          <List
            itemLayout="horizontal"
            dataSource={dummyQuizzes}
            renderItem={renderQuizItem}
          />
        </TabPane>
        <TabPane tab="Drafts (5)" key="drafts">
          {/* Add content for drafts tab */}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default QuizLibrary;