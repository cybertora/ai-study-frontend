// file: frontend/app/exam/page.js
'use client';
import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getTests, startExam } from '@/lib/api';
import { initSocket, disconnectSocket } from '@/lib/socket';
import toast from 'react-hot-toast';
import { FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';

export default function ExamPage() {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [examSession, setExamSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [remainingTime, setRemainingTime] = useState(0);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);

  // Загрузка списка тестов
  useEffect(() => {
    getTests({ limit: 20 })
      .then((response) => {
        setTests(response.data.data.tests || []);
      })
      .catch((error) => {
        console.error('Failed to load tests:', error);
        toast.error('Не удалось загрузить тесты');
      });
  }, []);

  // Очистка сокета при размонтировании компонента
  useEffect(() => {
    return () => {
      if (socket) {
        disconnectSocket();
        setSocket(null);
      }
    };
  }, [socket]);

  // Запуск экзамена
  const handleStartExam = async (testId) => {
    setLoading(true);
    try {
      const response = await startExam({ testId });
      const { examId, socketRoomId, timeLimit } = response.data.data;

      const socketInstance = initSocket();
      setSocket(socketInstance);

      socketInstance.emit('join-exam', { examId });

      socketInstance.on('exam-joined', (data) => {
        setExamSession({ examId, test: data.test });
        setRemainingTime(data.remainingTime || timeLimit * 60);
        setCurrentQuestion(0);
        setAnswers({});
        setFeedback({});
        toast.success('Экзамен начался!');
      });

      socketInstance.on('time-update', (data) => {
        setRemainingTime(data.remainingTime);
      });

      socketInstance.on('answer-feedback', (data) => {
        setFeedback((prev) => ({
          ...prev,
          [data.questionIndex]: data,
        }));
        toast.success(`Вопрос ${data.questionIndex + 1} отправлен`);
      });

      socketInstance.on('exam-expired', () => {
        toast.error('Время вышло! Экзамен завершается.');
        handleFinishExam();
      });

      socketInstance.on('exam-finished', (data) => {
        toast.success(`Экзамен завершён! Результат: ${data.score || '—'}`);
        // Можно перейти на страницу результатов
        // router.push(`/exam/result/${examId}`);
      });

      socketInstance.on('error', (error) => {
        toast.error(error.message || 'Произошла ошибка');
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Не удалось начать экзамен';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Отправка ответа на текущий вопрос
  const handleSubmitAnswer = (questionIndex, answer) => {
    if (!socket || !examSession) return;

    socket.emit('submit-answer', {
      examId: examSession.examId,
      questionIndex,
      answer,
    });

    // Оптимистическое обновление локального состояния
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  // Переход к следующему вопросу
  const handleNextQuestion = () => {
    if (currentQuestion < examSession?.test?.questions?.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  // Переход к предыдущему вопросу
  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  // Завершение экзамена (принудительно или по таймеру)
  const handleFinishExam = () => {
    if (socket && examSession) {
      socket.emit('finish-exam', { examId: examSession.examId });
    }
    setExamSession(null);
    setSocket((prev) => {
      if (prev) disconnectSocket();
      return null;
    });
  };

  // Форматирование оставшегося времени
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          {!examSession ? (
            // Экран выбора теста
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold mb-8 text-center">Выберите тест</h1>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tests.map((test) => (
                  <div
                    key={test._id}
                    className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow"
                  >
                    <h2 className="text-xl font-semibold mb-2">{test.title}</h2>
                    <p className="text-gray-600 mb-4">{test.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Вопросов: {test.questions?.length || '?'}
                      </span>
                      <button
                        onClick={() => handleStartExam(test._id)}
                        className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Начать
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {tests.length === 0 && (
                <p className="text-center text-gray-500 mt-12">
                  Тесты пока недоступны...
                </p>
              )}
            </div>
          ) : (
            // Экран самого экзамена
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold">
                    {examSession.test.title}
                  </h1>
                  <div className="flex items-center gap-2 text-lg font-medium">
                    <FiClock className="text-red-500" />
                    <span className={remainingTime < 300 ? 'text-red-600' : ''}>
                      {formatTime(remainingTime)}
                    </span>
                  </div>
                </div>

                {/* Прогресс */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{
                      width: `${
                        ((currentQuestion + 1) /
                          examSession.test.questions.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>

                {/* Вопрос */}
                {examSession.test.questions && (
                  <div className="mb-8">
                    <h2 className="text-xl font-medium mb-4">
                      Вопрос {currentQuestion + 1} из{' '}
                      {examSession.test.questions.length}
                    </h2>

                    <p className="text-lg mb-6">
                      {examSession.test.questions[currentQuestion]?.text}
                    </p>

                    {/* Варианты ответа */}
                    <div className="space-y-3">
                      {examSession.test.questions[currentQuestion]?.options?.map(
                        (option, idx) => (
                          <button
                            key={idx}
                            onClick={() =>
                              handleSubmitAnswer(currentQuestion, option)
                            }
                            className={`w-full text-left p-4 border rounded-lg transition-colors ${
                              answers[currentQuestion] === option
                                ? 'border-blue-500 bg-blue-50'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            {option}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Навигация и завершение */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-4">
                    <button
                      onClick={handlePrevQuestion}
                      disabled={currentQuestion === 0}
                      className="px-5 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
                    >
                      Назад
                    </button>
                    <button
                      onClick={handleNextQuestion}
                      disabled={
                        currentQuestion ===
                        examSession.test.questions?.length - 1
                      }
                      className="px-5 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
                    >
                      Далее
                    </button>
                  </div>

                  <button
                    onClick={handleFinishExam}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Завершить экзамен
                  </button>
                </div>
              </div>

              {/* Легенда обратной связи (можно улучшить) */}
              <div className="text-sm text-gray-500 mt-4">
                Отправленные ответы отмечены синим цветом
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}