import React, { useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/renderer/components/ui/button";
import { Input } from "@/renderer/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/renderer/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/renderer/components/ui/accordion";
import { ChevronLeft } from "lucide-react";

const QuizManager: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { newQuestion } = state || {};
  const [questions, setQuestions] = useState([
    { id: 1, type: 'Fill in the Blank', time: '1 minutes', points: 1, question: 'Hellow', answer: 'World' }
  ]);

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-3xl font-bold">Untitled Quiz</h1>
        </div>
        <div className="space-x-2">
          <Button variant="outline">Settings</Button>
          <Button variant="outline">Preview</Button>
          <Button variant="default">Publish</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        <div className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Bulk update questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="time">
                  <AccordionTrigger>Time</AccordionTrigger>
                  <AccordionContent>
                    {/* Time options */}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="points">
                  <AccordionTrigger>Points</AccordionTrigger>
                  <AccordionContent>
                    {/* Points options */}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Import from</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-between">
                Google Forms <span>▶</span>
              </Button>
              <Button variant="outline" className="w-full justify-between">
                Spreadsheet <span>▶</span>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Search questions</CardTitle>
            </CardHeader>
            <CardContent className="flex space-x-2">
              <Input type="text" placeholder="Enter topic name" className="flex-grow" />
              <Button variant="outline">Search</Button>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Questions summary</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <span className="text-lg">{questions.length} question ({questions.reduce((sum, q) => sum + q.points, 0)} points)</span>
              <Button variant="outline">+ Add question</Button>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Questions list</CardTitle>
            </CardHeader>
            <CardContent>
              {questions.map(q => (
                <div key={q.id} className="mb-4 p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{q.type}</span>
                    <div className="space-x-2 text-sm text-gray-600">
                      <span>{q.time}</span>
                      <span>•</span>
                      <span>{q.points} point{q.points !== 1 && 's'}</span>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="font-medium">{q.question}</div>
                    <div className="text-sm text-gray-600">Answer: {q.answer}</div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm">Delete</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button variant="outline" size="lg">+ Add question</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizManager;