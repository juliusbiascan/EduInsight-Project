import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LeftOutlined, SaveOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Layout, Button, Select, Radio, Checkbox, Input, Space, Typography, Tabs, Tooltip, Card } from 'antd';
import { questionTypes } from '@/renderer/types/quiz';

const { Header, Content } = Layout;
const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

const QuizQuestions: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [questionType, setQuestionType] = useState(location.state?.questionType || questionTypes[0]);
  const [timeLimit, setTimeLimit] = useState(30);
  const [points, setPoints] = useState(1);
  const [answerType, setAnswerType] = useState("single");
  const [answerOptions, setAnswerOptions] = useState([
    { id: 1, text: "", isCorrect: false },
    { id: 2, text: "", isCorrect: false },
    { id: 3, text: "", isCorrect: false },
    { id: 4, text: "", isCorrect: false },
  ]);
  const [question, setQuestion] = useState("");

  const handleAnswerOptionChange = (id: number, text: string) => {
    setAnswerOptions(options =>
      options.map(option =>
        option.id === id ? { ...option, text } : option
      )
    );
  };

  const handleCorrectAnswerChange = (id: number) => {
    setAnswerOptions(options =>
      options.map(option =>
        answerType === "single"
          ? { ...option, isCorrect: option.id === id }
          : option.id === id
            ? { ...option, isCorrect: !option.isCorrect }
            : option
      )
    );
  };

  const addAnswerOption = () => {
    setAnswerOptions(options => [
      ...options,
      { id: options.length + 1, text: "", isCorrect: false },
    ]);
  };

  const deleteAnswerOption = (id: number) => {
    setAnswerOptions(options => options.filter(option => option.id !== id));
  };

  const handleSaveQuestion = () => {
    const questionData = {
      questionType: questionType.label,
      points,
      timeLimit,
      answerType,
      question,
      options: answerOptions,
    };

    navigate('/quiz-manager', { state: { newQuestion: questionData } });
  };

  const renderQuestionContent = () => {
    switch (questionType.label) {
      case "Multiple Choice":
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <TextArea
              rows={4}
              placeholder="Type question here"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              style={{ marginBottom: '16px' }}
            />
            <Tabs activeKey={answerType} onChange={setAnswerType}>
              <Tabs.TabPane tab="Single correct answer" key="single">
                <Radio.Group style={{ width: '100%' }}>
                  {answerOptions.map((option) => (
                    <Card key={option.id} style={{ marginBottom: '8px' }}>
                      <Space>
                        <Radio
                          checked={option.isCorrect}
                          onChange={() => handleCorrectAnswerChange(option.id)}
                        />
                        <Input
                          value={option.text}
                          onChange={(e) => handleAnswerOptionChange(option.id, e.target.value)}
                          placeholder={`Option ${option.id}`}
                          style={{ width: '300px' }}
                        />
                        <Button
                          icon={<DeleteOutlined />}
                          onClick={() => deleteAnswerOption(option.id)}
                          disabled={answerOptions.length <= 2}
                        />
                      </Space>
                    </Card>
                  ))}
                </Radio.Group>
              </Tabs.TabPane>
              <Tabs.TabPane tab="Multiple correct answers" key="multiple">
                <Checkbox.Group style={{ width: '100%' }}>
                  {answerOptions.map((option) => (
                    <Card key={option.id} style={{ marginBottom: '8px' }}>
                      <Space>
                        <Checkbox
                          checked={option.isCorrect}
                          onChange={() => handleCorrectAnswerChange(option.id)}
                        />
                        <Input
                          value={option.text}
                          onChange={(e) => handleAnswerOptionChange(option.id, e.target.value)}
                          placeholder={`Option ${option.id}`}
                          style={{ width: '300px' }}
                        />
                        <Button
                          icon={<DeleteOutlined />}
                          onClick={() => deleteAnswerOption(option.id)}
                          disabled={answerOptions.length <= 2}
                        />
                      </Space>
                    </Card>
                  ))}
                </Checkbox.Group>
              </Tabs.TabPane>
            </Tabs>
            <Button icon={<PlusOutlined />} onClick={addAnswerOption} style={{ marginTop: '16px' }}>
              Add another option
            </Button>
          </Space>
        );
      default:
        return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Title level={3}>This question type is under development.</Title>
          </div>
        );
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        <Space>
          <Button icon={<LeftOutlined />} onClick={() => navigate(-1)} />
          <Select
            value={questionType.label}
            style={{ width: 180 }}
            onChange={(value) => setQuestionType(questionTypes.find(type => type.label === value) || questionTypes[0])}
          >
            {questionTypes.map((type) => (
              <Option key={type.label} value={type.label}>
                {type.icon} {type.label}
              </Option>
            ))}
          </Select>
        </Space>
        <Space>
          <Select value={points.toString()} style={{ width: 120 }} onChange={(value) => setPoints(parseInt(value))}>
            {[1, 2, 3].map((value) => (
              <Option key={value} value={value.toString()}>{value} point{value > 1 ? 's' : ''}</Option>
            ))}
          </Select>
          <Select value={timeLimit.toString()} style={{ width: 140 }} onChange={(value) => setTimeLimit(parseInt(value))}>
            <Option value="30">30 seconds</Option>
            <Option value="60">1 minute</Option>
            <Option value="120">2 minutes</Option>
          </Select>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveQuestion}>
            Save question
          </Button>
        </Space>
      </Header>
      <Content style={{ padding: '24px', backgroundColor: '#f0f2f5' }}>
        <Card>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space wrap style={{ marginBottom: '16px' }}>
              {['A', 'B', 'I', 'U', 'S'].map((item) => (
                <Tooltip key={item} title={getTooltipLabel(item)}>
                  <Button>{item}</Button>
                </Tooltip>
              ))}
              {['superscript', 'subscript', 'equation'].map((type) => (
                <Tooltip key={type} title={getTooltipLabel(type)}>
                  <Button>
                    {type === 'superscript' && <span>X<sup>2</sup></span>}
                    {type === 'subscript' && <span>X<sub>2</sub></span>}
                    {type === 'equation' && <span>Σ</span>}
                  </Button>
                </Tooltip>
              ))}
            </Space>
            {renderQuestionContent()}
          </Space>
        </Card>
      </Content>
    </Layout>
  );
};

// Helper function to get tooltip labels
const getTooltipLabel = (item: string) => {
  const labels: { [key: string]: string } = {
    'A': 'Font family',
    'B': 'Bold',
    'I': 'Italic',
    'U': 'Underline',
    'S': 'Strikethrough',
    'superscript': 'Superscript',
    'subscript': 'Subscript',
    'equation': 'Insert equation'
  };
  return labels[item] || item;
};

export default QuizQuestions;