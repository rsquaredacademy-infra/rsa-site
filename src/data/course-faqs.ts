import { courses } from './site';

export interface CourseFaq {
  question: string;
  answer: string;
}

const nextCourses = {
  intro: 'Continue with Data Wrangling with dplyr, then Data Viz with ggplot2.',
  dplyr: 'Continue with Data Viz with ggplot2 to turn your data into charts.',
  ggplot2: 'Practise with your own data, or read our free eBooks to explore more R topics.',
};

// Keep the visible answers and FAQPage JSON-LD on the same source of truth.
export const freeCoursePages = courses.map((course) => {
  const slug = course.id === 'intro' ? 'intro-r' : course.id;
  const name = course.id === 'intro' ? 'Intro to R' : course.id;
  const faqs: CourseFaq[] = [
    {
      question: `Is the ${name} course free?`,
      answer: `Yes. ${course.title} is free forever. You can start without signing up.`,
    },
    {
      question: 'Do I need to install R?',
      answer: 'No. You write and run R in your browser, with instant feedback. You do not need to install R, RStudio or any packages to take this course.',
    },
    {
      question: 'How long does it take?',
      answer: 'The course is self-paced, with no fixed completion time. Work through the lessons and exercises at your own pace, and take breaks between lessons as you need.',
    },
    {
      question: 'Do I get a certificate?',
      answer: 'Not yet. We do not currently issue a certificate for this course.',
    },
    {
      question: 'Is it for complete beginners?',
      answer: course.id === 'intro'
        ? 'Yes. Introduction to R starts with your first line of code. You do not need any programming experience.'
        : `You do not need experience with ${course.id}, but you should know basic R: values, vectors and data frames. If you are new to programming, take our free Introduction to R course first.`,
    },
    {
      question: 'What comes after this course?',
      answer: `${nextCourses[course.id as keyof typeof nextCourses]} Our introductions to R, SQL and Python are free forever. Intro to SQL and Intro to Python are coming in December 2026. Paid courses start on 26 January 2027.`,
    },
    {
      question: 'Can I use it on my phone?',
      answer: 'You can open the course in your phone browser. For writing and editing code, we recommend a laptop or desktop with a keyboard and more screen space.',
    },
    {
      question: 'Do I need to sign up to start?',
      answer: 'No. Use the start button to open the first lesson and begin without an account.',
    },
  ];
  return { ...course, slug, detailsHref: `/courses/${slug}/`, faqs };
});
