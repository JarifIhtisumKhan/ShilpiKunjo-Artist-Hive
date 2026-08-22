import React, { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, Clock, Users, ArrowLeft, CheckCircle2, PlayCircle, ShieldCheck, Filter } from 'lucide-react';

export default function CoursesView({ currentUser }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeDifficulty, setActiveDifficulty] = useState('All');
  const [enrollMsg, setEnrollMsg] = useState('');

  useEffect(() => {
    fetchCourses();
  }, [activeDifficulty]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      let url = '/api/courses';
      if (activeDifficulty !== 'All') {
        url += `?difficulty=${encodeURIComponent(activeDifficulty)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCourse = async (courseId) => {
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      const data = await res.json();
      setSelectedCourse(data);
      setEnrollMsg('');
    } catch (err) {
      console.error('Error loading course details:', err);
    }
  };

  const handleEnroll = async () => {
    if (!currentUser || !selectedCourse) return;
    try {
      const res = await fetch(`/api/courses/${selectedCourse.course_id}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.user_id })
      });
      const data = await res.json();
      setEnrollMsg(data.message || 'Enrolled successfully!');
    } catch (err) {
      setEnrollMsg('Enrollment failed.');
    }
  };

  // Inside Course: Linear Curriculum View (NOT masonry)
  if (selectedCourse) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Back Button */}
        <button
          onClick={() => setSelectedCourse(null)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Course Catalog</span>
        </button>

        {/* Course Header */}
        <div className="rounded-3xl border border-[#ab946a] bg-[#c6ae82] p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-[#aca04d]/20 text-[#315812] border border-[#315812]/30">
                {selectedCourse.category}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#b8a074] text-gray-950">
                {selectedCourse.difficulty} Level
              </span>
            </div>
            
            <button
              onClick={handleEnroll}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#aca04d] to-[#315812] text-white hover:opacity-95 shadow-md shadow-[#315812]/20 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Enroll In Masterclass</span>
            </button>
          </div>

          {enrollMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {enrollMsg}
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-black text-gray-950">
            {selectedCourse.title}
          </h1>

          <div className="flex items-center gap-3 pt-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#aca04d] to-[#315812] flex items-center justify-center font-bold text-xs text-white">
              {selectedCourse.instructor_name?.charAt(0) || 'I'}
            </div>
            <div>
              <p className="text-xs text-gray-700">Instructor</p>
              <h4 className="text-sm font-bold text-gray-950">{selectedCourse.instructor_name}</h4>
            </div>
          </div>
        </div>

        {/* Linear Curriculum & Lesson List (Strictly Linear) */}
        <div className="rounded-3xl border border-[#ab946a] bg-[#c6ae82] p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#ab946a]">
            <h3 className="text-lg font-bold text-gray-950 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#315812]" />
              Sequential Curriculum ({selectedCourse.lessons?.length || 0} Lessons)
            </h3>
            <span className="text-xs text-gray-700">Step-by-Step Learning</span>
          </div>

          <div className="space-y-3 pt-2">
            {(!selectedCourse.lessons || selectedCourse.lessons.length === 0) ? (
              <p className="text-xs text-gray-700 italic">No lesson content uploaded yet.</p>
            ) : (
              selectedCourse.lessons.map((lesson, idx) => (
                <a
                  key={lesson.content_id}
                  href={lesson.content_url || "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-2xl bg-[#b8a074] border border-[#9d865c] hover:border-[#315812] hover:bg-[#ad966a] transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#a89064] group-hover:bg-[#315812] group-hover:text-white flex items-center justify-center text-xs font-bold text-gray-950 transition-colors">
                      {lesson.sequence_order}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-950 transition-colors">
                        {lesson.title}
                      </h4>
                      <p className="text-[11px] text-gray-700 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-gray-700" /> ~25 mins video lesson
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white bg-gradient-to-r from-[#aca04d] to-[#315812] px-3 py-1.5 rounded-xl border border-[#315812]/30 flex items-center gap-1.5 shadow-sm">
                      <PlayCircle className="w-4 h-4" /> Start Lesson
                    </span>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>

      </div>
    );
  }

  // Course Catalog Grid
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-[#c6ae82] p-6 sm:p-8 rounded-3xl border border-[#ab946a] shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="w-4 h-4 text-[#315812]" />
          <span className="text-xs font-black uppercase tracking-wider text-[#315812]">Masterclass Hub</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
          Art Courses & Masterclasses
        </h1>
        <p className="text-xs sm:text-sm text-gray-800 mt-1 max-w-xl">
          Learn traditional Bengali painting, digital concept art, and 3D modeling with sequential curriculum taught by masters.
        </p>
      </div>

      {/* Difficulty Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 pr-2 border-r border-gray-800">
          <Filter className="w-3.5 h-3.5 text-amber-400" />
          <span>Difficulty:</span>
        </div>
        {['All', 'Beginner', 'Intermediate', 'Advanced'].map(diff => (
          <button
            key={diff}
            onClick={() => setActiveDifficulty(diff)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeDifficulty === diff
                ? 'bg-amber-500 text-gray-950 shadow-md shadow-amber-500/20'
                : 'bg-gray-900/80 text-gray-400 hover:text-white border border-gray-800/80'
            }`}
          >
            {diff}
          </button>
        ))}
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(c => (
          <div
            key={c.course_id}
            onClick={() => openCourse(c.course_id)}
            className="group cursor-pointer rounded-3xl overflow-hidden bg-gray-900/90 border border-gray-800 hover:border-amber-500/50 transition-all duration-300 shadow-xl flex flex-col justify-between"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {c.category}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                  {c.difficulty}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors leading-snug">
                {c.title}
              </h3>

              <div className="flex items-center gap-2.5 pt-1">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-bold text-[10px] text-gray-950">
                  {c.instructor_name?.charAt(0) || 'I'}
                </div>
                <span className="text-xs font-medium text-gray-300">{c.instructor_name}</span>
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-gray-800/60 mt-2 pt-3 flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                {c.lesson_count || 0} Lessons
              </span>
              <span className="flex items-center gap-1.5 font-bold text-gray-300">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                {c.student_count || 0} Students
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
