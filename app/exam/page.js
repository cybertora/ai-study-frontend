// file: frontend/app/exam/page.js
'use client';
import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getTests, startExam } from '@/lib/api';
import { initSocket, disconnectSocket } from '@/lib/socket';
import toast from 'react-hot-toast';
import { FiClock } from 'react-icons/fi';

export default function ExamPage() {
  const [tests, setTests] = useState([]);
  const [examSession, setExamSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [remainingTime, setRemainingTime] = useState(0);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [examResults, setExamResults] = useState(null);
  const [finishing, setFinishing] = useState(false);
  const [reviewModal, setReviewModal] = useState(null); // { testId, exams: [] }

  // Загрузка тестов
  useEffect(() => {
    getTests({ limit: 20 })
      .then((response) => setTests(response.data.data.tests || []))
      .catch((err) => {
        console.error('Failed to load tests:', err);
        toast.error('Не удалось загрузить тесты');
      });
  }, []);

  // Очистка сокета
  useEffect(() => {
    return () => {
      if (socket) {
        disconnectSocket();
        setSocket(null);
      }
    };
  }, [socket]);

  // Начать новый экзамен (с forceNew: true)
  const handleStartNewExam = async (testId) => {
    setLoading(true);
    try {
      // forceNew: true — сервер завершит старую сессию как expired
      const res = await startExam({ testId, forceNew: true });
      const { examId, timeLimit } = res.data.data;

      const socketInstance = initSocket();
      setSocket(socketInstance);
      socketInstance.emit('join-exam', { examId });

      socketInstance.on('exam-joined', (data) => {
        setExamSession({ examId, test: data.test });
        setRemainingTime(data.remainingTime || timeLimit * 60);
        setCurrentQuestion(0);
        setAnswers({});
        setFeedback({});
        toast.success('Новый экзамен начат!');
      });

      socketInstance.on('time-update', (data) => {
        setRemainingTime(data.remainingTime);
      });

      socketInstance.on('answer-feedback', (data) => {
        setFeedback((prev) => ({
          ...prev,
          [data.questionIndex]: data,
        }));
      });

      socketInstance.on('exam-expired', () => {
        toast.error('Время вышло! Экзамен завершается автоматически.');
        finishExam();
      });

      socketInstance.on('exam-finished', (data) => {
        toast.dismiss();
        setExamResults(data);
        setExamSession(null);
        setFinishing(false);
        disconnectSocket();
        toast.success(`Результат: ${data.score}%`);
      });

      socketInstance.on('error', (err) => {
        toast.error(err.message || 'Произошла ошибка');
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Не удалось начать экзамен');
    } finally {
      setLoading(false);
    }
  };

  // Показать результаты прошлых попыток
  const handleViewReview = async (testId) => {
    try {
      const res = await fetch(`/api/exam/test/${testId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      const data = await res.json();

      if (data.success && data.data.exams?.length > 0) {
        setReviewModal({ testId, exams: data.data.exams });
      } else {
        toast.info('По этому тесту ещё нет завершённых попыток');
      }
    } catch (err) {
      toast.error('Не удалось загрузить историю попыток');
    }
  };

  const handleSubmitAnswer = (questionIndex, answer) => {
    if (!socket || !examSession) return;

    socket.emit('submit-answer', {
      examId: examSession.examId,
      questionIndex,
      answer,
    });

    setAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < examSession?.test?.questions?.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const finishExam = () => {
    if (!socket || !examSession) return;

    setFinishing(true);
    toast.loading('Завершаем экзамен и подсчитываем результаты...');

    socket.emit('finish-exam', { examId: examSession.examId });
    setExamSession(null);
  };

  const confirmFinishExam = () => {
    if (window.confirm('Вы уверены, что хотите завершить экзамен сейчас?')) {
      finishExam();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          {/* Модалка с историей попыток */}
          {reviewModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">История попыток</h2>
                  <button
                    onClick={() => setReviewModal(null)}
                    className="text-3xl text-gray-500 hover:text-gray-800"
                  >
                    ×
                  </button>
                </div>

                {reviewModal.exams.map((exam) => (
                  <div key={exam._id} className="border-b py-5 last:border-b-0">
                    <p className="font-medium text-gray-700">
                      {new Date(exam.endTime).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                      {exam.score}%
                    </p>
                    <p className="mt-1">
                      Правильных: <strong>{exam.answers?.filter(a => a.isCorrect).length || 0}</strong> из{' '}
                      <strong>{exam.test?.questions?.length || '?'}</strong>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Время: {Math.floor(exam.timeSpent / 60)} мин {exam.timeSpent % 60} сек
                    </p>
                  </div>
                ))}

                <button
                  onClick={() => setReviewModal(null)}
                  className="mt-6 w-full py-3 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Закрыть
                </button>
              </div>
            </div>
          )}

          {/* Промежуточный экран завершения */}
          {finishing && (
            <div className="max-w-2xl mx-auto mt-20 text-center">
              <LoadingSpinner size="large" />
              <p className="mt-8 text-xl font-medium text-gray-800">
                Подсчитываем результаты...
              </p>
              <p className="mt-3 text-gray-600">
                Это займёт всего несколько секунд
              </p>
            </div>
          )}

          {/* Экран результатов текущего экзамена */}
          {examResults && !finishing && (
            <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-xl text-center">
              <h2 className="text-3xl font-bold text-green-700 mb-6">
                Экзамен завершён!
              </h2>

              <div className="text-6xl font-extrabold text-blue-600 mb-4">
                {examResults.score}%
              </div>

              <p className="text-2xl mb-4">
                Правильных ответов:{' '}
                <strong>{examResults.correctAnswers}</strong> из{' '}
                <strong>{examResults.totalQuestions}</strong>
              </p>

              <p className="text-lg text-gray-600 mb-8">
                Время: {Math.floor(examResults.timeSpent / 60)} мин{' '}
                {examResults.timeSpent % 60} сек
              </p>

              <button
                onClick={() => {
                  setExamResults(null);
                  getTests({ limit: 20 }).then((r) =>
                    setTests(r.data.data.tests || [])
                  );
                }}
                className="px-10 py-4 bg-blue-600 text-white text-lg font-medium rounded-xl hover:bg-blue-700 transition"
              >
                Вернуться к выбору тестов
              </button>
            </div>
          )}

          {/* Экран выбора теста */}
          {!examSession && !examResults && !finishing && (
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold mb-8 text-center">Выберите тест</h1>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tests.map((test) => (
                  <div
                    key={test._id}
                    className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow flex flex-col"
                  >
                    <h2 className="text-xl font-semibold mb-4">{test.title}</h2>

                    <div className="mt-auto flex gap-3">
                      <button
                        onClick={() => handleViewReview(test._id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg transition text-sm font-medium"
                      >
                        Результаты
                      </button>
                      <button
                        onClick={() => handleStartNewExam(test._id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg transition text-sm font-medium"
                      >
                        Начать заново
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {tests.length === 0 && (
                <p className="text-center text-gray-500 mt-12 text-lg">
                  У вас пока нет созданных тестов...
                </p>
              )}
            </div>
          )}

          {/* Экран активного экзамена */}
          {examSession && !finishing && !examResults && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold">{examSession.test.title}</h1>
                  <div className="flex items-center gap-3 text-lg font-medium">
                    <FiClock className={remainingTime < 300 ? 'text-red-600' : 'text-red-500'} />
                    <span className={remainingTime < 300 ? 'text-red-600' : ''}>
                      {formatTime(remainingTime)}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 mb-8">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentQuestion + 1) / examSession.test.questions.length) * 100}%`,
                    }}
                  />
                </div>

                {examSession.test.questions && (
                  <div className="mb-10">
                    <h2 className="text-xl font-medium mb-5">
                      Вопрос {currentQuestion + 1} из {examSession.test.questions.length}
                    </h2>

                    <p className="text-lg leading-relaxed mb-8">
                      {examSession.test.questions[currentQuestion]?.question || 'Загрузка вопроса...'}
                    </p>

                    <div className="space-y-4">
                      {examSession.test.questions[currentQuestion]?.options?.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSubmitAnswer(currentQuestion, option)}
                          className={`w-full text-left p-4 border rounded-lg transition-all ${
                            answers[currentQuestion] === option
                              ? 'border-blue-500 bg-blue-50 font-medium'
                              : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center mt-8">
                  <div className="flex gap-4">
                    <button
                      onClick={handlePrevQuestion}
                      disabled={currentQuestion === 0}
                      className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
                    >
                      Назад
                    </button>
                    <button
                      onClick={handleNextQuestion}
                      disabled={currentQuestion === examSession.test.questions?.length - 1}
                      className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
                    >
                      Далее
                    </button>
                  </div>

                  <button
                    onClick={confirmFinishExam}
                    className="px-8 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition shadow-sm"
                  >
                    Завершить экзамен
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-500 text-center">
                Отправленные ответы отмечены синим цветом
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}