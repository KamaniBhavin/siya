'use client';
import { useEffect, useState } from 'react';

type TypingAnimationProps = {
  text: string;
};

function TypingAnimation({ text }: TypingAnimationProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIndex((index) => index + 1);
    }, 100);

    return () => clearTimeout(timeout);
  }, [index]);

  useEffect(() => {
    setIndex(0);
  }, [text]);

  return (
    <div>
      <h1 className="text-siya-blue hover:text-siya-yellow inline-block text-xl font-bold md:text-5xl">
        {text.substring(0, index + 1)}
      </h1>
      <span className="inline-block animate-pulse text-2xl md:text-5xl">
        |
      </span>
    </div>
  );
}

type TypewriterProps = {
  questions: string[];
};
export default function Typewriter({ questions }: TypewriterProps) {
  const [index, setIndex] = useState(0);
  const question = questions[index % questions.length];

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIndex((index) => index + 1);
    }, question.length * 100 + 1000);

    return () => clearTimeout(timeout);
  }, [question, questions, index]);

  return <TypingAnimation text={question} />;
}
