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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 relative z-10">

        {/* Back Button */}
        <button
          onClick={() => setSelectedCourse(null)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#091f1b]/80 border border-emerald-500/30 text-emerald-200 hover:text-white hover:border-pink-400 transition-colors text-xs font-semibold backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Course Catalog 🌸</span>
        </button>

        {/* Course Header (Reduced Opacity) */}
        <div className="rounded-3xl border border-emerald-400/20 bg-[#0c2428]/40 backdrop-blur-md p-6 sm:p-8 space-y-4 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30">
                {selectedCourse.category}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#0d2823] text-emerald-200 border border-emerald-500/20">
                {selectedCourse.difficulty} Level
              </span>
            </div>

            <button
              onClick={handleEnroll}
              className="px-5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-pink-400 via-orange-300 to-amber-300 text-gray-950 hover:opacity-95 shadow-md shadow-pink-500/20 flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Enroll In Masterclass 🌸</span>
            </button>
          </div>

          {enrollMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-pink-300" />
              {enrollMsg}
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {selectedCourse.title}
          </h1>

          <div className="flex items-center gap-3 pt-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-400 to-amber-400 flex items-center justify-center font-bold text-xs text-gray-950 shadow">
              {selectedCourse.instructor_name?.charAt(0) || 'I'}
            </div>
            <div>
              <p className="text-xs text-emerald-300/70">Instructor</p>
              <h4 className="text-sm font-bold text-emerald-100">{selectedCourse.instructor_name}</h4>
            </div>
          </div>
        </div>

        {/* Linear Curriculum & Lesson List (Strictly Linear) */}
        <div className="rounded-3xl border border-emerald-400/25 glass-panel p-6 sm:p-8 space-y-4 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-pink-300" />
              Sequential Curriculum ({selectedCourse.lessons?.length || 0} Lessons)
            </h3>
            <span className="text-xs text-emerald-300/70">Step-by-Step Learning</span>
          </div>

          <div className="space-y-3 pt-2">
            {(!selectedCourse.lessons || selectedCourse.lessons.length === 0) ? (
              <p className="text-xs text-emerald-300/50 italic">No lesson content uploaded yet.</p>
            ) : (
              selectedCourse.lessons.map((lesson, idx) => (
                <a
                  key={lesson.content_id}
                  href={lesson.content_url || "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-2xl bg-[#091f1b]/70 border border-emerald-500/20 hover:border-pink-400/50 hover:bg-[#0e2d27] transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#0d2a24] group-hover:bg-pink-500/20 group-hover:text-pink-300 flex items-center justify-center text-xs font-bold text-emerald-200 transition-colors">
                      {lesson.sequence_order}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-100 group-hover:text-white transition-colors">
                        {lesson.title}
                      </h4>
                      <p className="text-[11px] text-emerald-300/60 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-pink-300" /> ~25 mins video lesson
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-pink-300 bg-pink-500/15 px-3 py-1.5 rounded-xl border border-pink-500/30 group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-amber-300 group-hover:text-gray-950 transition-all flex items-center gap-1.5 shadow-sm">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 relative z-10">

      {/* Header Banner (Reduced Opacity) */}
      <div className="bg-[#0c2428]/40 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-emerald-400/20 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <GraduationCap className="w-4 h-4 text-pink-300" />
            <span className="text-[11px] font-black uppercase tracking-wider text-pink-300 px-2.5 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/30">
              Masterclass Hub 🌸
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-rustic font-normal tracking-wide text-white flex items-center gap-2 drop-shadow-md">
            <span>Art Courses & Masterclasses</span>
            <span className="text-2xl">🎨</span>
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 mt-1.5 max-w-xl">
            Learn traditional Bengali painting, digital concept art, and 3D modeling with sequential curriculum taught by masters.
          </p>
        </div>
      </div>

      {/* Difficulty Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-1.5 text-xs text-emerald-300/80 pr-2 border-r border-emerald-500/30">
          <Filter className="w-3.5 h-3.5 text-pink-300" />
          <span>Difficulty:</span>
        </div>
        {['All', 'Beginner', 'Intermediate', 'Advanced'].map(diff => (
          <button
            key={diff}
            onClick={() => setActiveDifficulty(diff)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${activeDifficulty === diff
                ? 'bg-gradient-to-r from-pink-400 via-orange-300 to-amber-300 text-gray-950 shadow-md shadow-pink-500/25'
                : 'bg-[#091f1b]/80 text-emerald-200/80 hover:text-white border border-emerald-500/25 hover:border-pink-300/40 hover:bg-[#0e2c26]'
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
            className="group cursor-pointer rounded-3xl overflow-hidden glass-card hover:border-pink-400/50 transition-all duration-300 shadow-xl flex flex-col justify-between"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-md bg-pink-500/15 text-pink-300 border border-pink-500/30">
                  {c.category}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#0d2823] text-emerald-200 border border-emerald-500/20">
                  {c.difficulty}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-pink-300 transition-colors leading-snug">
                {c.title}
              </h3>

              <div className="flex items-center gap-2.5 pt-1">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-400 to-amber-400 flex items-center justify-center font-bold text-[10px] text-gray-950 shadow">
                  {c.instructor_name?.charAt(0) || 'I'}
                </div>
                <span className="text-xs font-medium text-emerald-200">{c.instructor_name}</span>
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-emerald-500/15 mt-2 pt-3 flex items-center justify-between text-xs text-emerald-300/70">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-pink-300" />
                {c.lesson_count || 0} Lessons
              </span>
              <span className="flex items-center gap-1.5 font-bold text-emerald-200">
                <Users className="w-3.5 h-3.5 text-amber-300" />
                {c.student_count || 0} Students
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
