import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/renderer/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/renderer/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/renderer/components/ui/tooltip";
import { Button } from '@/renderer/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/renderer/components/ui/tabs";
import { questionTypes } from './quiz-create'; // Import the questionTypes array

const QuizQuestions = () => {
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
          <>
            <textarea
              className="w-full h-32 p-2 bg-purple-800 text-white rounded mb-4"
              placeholder="Type question here"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            {/* Existing answer options code */}
            <Tabs value={answerType} onValueChange={setAnswerType} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="single">Single correct answer</TabsTrigger>
                <TabsTrigger value="multiple">Multiple correct answers</TabsTrigger>
              </TabsList>
              <TabsContent value="single" className="space-y-2">
                {answerOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={option.isCorrect}
                      onChange={() => handleCorrectAnswerChange(option.id)}
                      className="w-4 h-4"
                    />
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => handleAnswerOptionChange(option.id, e.target.value)}
                      placeholder={`Option ${option.id}`}
                      className="flex-grow p-2 bg-purple-800 text-white rounded"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAnswerOption(option.id)}
                      disabled={answerOptions.length <= 2}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="multiple" className="space-y-2">
                {answerOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={option.isCorrect}
                      onChange={() => handleCorrectAnswerChange(option.id)}
                      className="w-4 h-4"
                    />
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => handleAnswerOptionChange(option.id, e.target.value)}
                      placeholder={`Option ${option.id}`}
                      className="flex-grow p-2 bg-purple-800 text-white rounded"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAnswerOption(option.id)}
                      disabled={answerOptions.length <= 2}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
            <Button onClick={addAnswerOption} className="mt-4">
              Add another option
            </Button>
          </>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-white text-2xl">This question type is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between p-4 bg-background border-b">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Select
            value={questionType.label}
            onValueChange={(value) => setQuestionType(questionTypes.find(type => type.label === value) || questionTypes[0])}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Question type" />
            </SelectTrigger>
            <SelectContent>
              {questionTypes.map((type) => (
                <SelectItem key={type.label} value={type.label}>
                  {type.icon} {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-4">
          <Select value={points.toString()} onValueChange={(value) => setPoints(parseInt(value))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Points" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3].map((value) => (
                <SelectItem key={value} value={value.toString()}>{value} point{value > 1 ? 's' : ''}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeLimit.toString()} onValueChange={(value) => setTimeLimit(parseInt(value))}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time limit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 seconds</SelectItem>
              <SelectItem value="60">1 minute</SelectItem>
              <SelectItem value="120">2 minutes</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="secondary" onClick={handleSaveQuestion}>
            <Save className="mr-2 h-4 w-4" />
            Save question
          </Button>
        </div>
      </header>

      <div className="border-b p-4">
        <TooltipProvider>
          <div className="flex items-center space-x-2">
            <ToggleGroup type="multiple" variant="outline">
              {['A', 'B', 'I', 'U', 'S'].map((item) => (
                <Tooltip key={item}>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem value={item.toLowerCase()} aria-label={getTooltipLabel(item)}>
                      {item}
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>{getTooltipLabel(item)}</TooltipContent>
                </Tooltip>
              ))}
            </ToggleGroup>
            {['superscript', 'subscript', 'equation'].map((type) => (
              <Tooltip key={type}>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    {type === 'superscript' && <span>X<sup>2</sup></span>}
                    {type === 'subscript' && <span>X<sub>2</sub></span>}
                    {type === 'equation' && <span>Σ</span>}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{getTooltipLabel(type)}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>

      {/* Question input area */}
      <div className="flex-grow p-4 bg-purple-900 overflow-y-auto">
        {renderQuestionContent()}
      </div>
    </div>
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