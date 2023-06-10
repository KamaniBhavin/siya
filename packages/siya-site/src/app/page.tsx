'use client';
import Typewriter from '@/app/typewriter';
import Image from 'next/image';
import BackgroundCircles from '@/app/background_circles';

export default function Home() {
  const questions = [
    'What did you do yesterday?',
    'What are you doing today?',
    'Any impediments in your way?',
  ];

  return (
    <>
      <div className="sticky top-0  flex min-h-screen flex-col gap-4 pt-32 items-center">
        <BackgroundCircles />

        {/* Animated Text center */}
        <Typewriter questions={questions} />
        <div className="w-fit text-center text-lg text-gray-500 md:text-xl">
          <h2 className="hidden md:block">
            A simple bot to automate and organize your team’s stand-ups.
          </h2>
          <h3>Perfect stand-up meetings every time.</h3>
        </div>
        <h2 className="text-siya-blue text-lg">
          Start Today: Install Siya for your team!
        </h2>
        <div className="flex items-center hover:opacity-75">
          <a href="https://slack.com/oauth/v2/authorize?client_id=4975212221364.4975287333588&scope=app_mentions:read,channels:join,channels:read,chat:write,chat:write.customize,chat:write.public,commands,groups:read,im:read,incoming-webhook,mpim:read,team:read,users:read,users:read.email,im:history&user_scope=">
            <img
              height={80}
              width={172}
              alt="Siya - Add to Slack"
              src="https://platform.slack-edge.com/img/add_to_slack.png"
              srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
            />
          </a>
        </div>
      </div>
      <div className="bg-siya-blue text-siya-yellow sticky top-5  flex min-h-screen flex-col items-center justify-center gap-6 px-16 lg:flex-row lg:gap-16 lg:px-48">
        <BackgroundCircles />
        <Image
          className="rounded-2xl shadow-xl"
          src="/team_work.webp"
          alt="Stand-up meetings with SIYA"
          width={500}
          height={500}
        />
        <div className="flex flex-col gap-4">
          <h3 className=" text-center text-2xl font-bold lg:text-4xl">
            Stay on top of your team’s progress.
          </h3>
          <p className=" text-center text-lg font-light text-gray-300 lg:text-xl">
            SIYA is a Slack bot that automates stand-up meetings for your team.
            It sends out a message to your team members at a specific time
            asking them to answer a few questions. Then, it compiles the
            responses and sends a summary to the channel of your choice.
          </p>
        </div>
      </div>
      <div className="bg-siya-yellow text-siya-blue sticky top-10 flex min-h-screen flex-col items-center justify-center gap-6 px-16 lg:flex-row lg:gap-16 lg:px-48">
        <BackgroundCircles />
        <div className="flex flex-col gap-4">
          <h3 className="text-center text-2xl font-bold lg:text-4xl">
            Customize your stand-up meetings.
          </h3>
          <p className="text-siya-blue/70 text-center text-lg font-light lg:text-xl">
            SIYA allows you to customize your stand-up meetings by asking
            different questions for each meeting. You can also choose the time
            and channel for your stand-up meetings.
          </p>
        </div>
        <Image
          className="rounded-2xl shadow-xl"
          src="/customisable.webp"
          alt="Customizable stand-up meetings"
          width={500}
          height={500}
        />
      </div>
      <div className="sticky top-16 flex  min-h-screen flex-col items-center justify-center gap-6 bg-white px-16 lg:flex-row lg:gap-16 lg:px-48">
        <BackgroundCircles />
        <Image
          className="rounded-2xl shadow-xl"
          src="/integration.webp"
          alt="Stand-up meetings with SIYA"
          width={500}
          height={500}
        />
        <div className="flex flex-col gap-4">
          <h3 className="text-siya-blue text-center text-2xl font-bold lg:text-4xl">
            Integrate with Atlassian Jira.
          </h3>
          <p className=" text-siya-blue text-center text-lg font-light lg:text-xl">
            SIYA integrates with Atlassian Jira to help you stay on top of your
            team’s progress. It can automatically create work logs for your team
            members based on their stand-up responses.
          </p>
        </div>
      </div>
    </>
  );
}
