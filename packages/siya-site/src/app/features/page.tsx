import Feature from '@/app/features/feature';

const features = [
  '💡 Reminds team members to share their stand-up answers',
  '📬 Sends team stand-up summaries at a specific time in the channel of your choice',
  '🎯 Customizes questions for each separate stand-up/meeting',
  '🌍 Supports teams in different time zones seamlessly',
  '⏰ Enables synchronous and asynchronous team stand-ups',
  '🚀 Integrates updates with Jira for streamlined workflows',
  "📝 Automatically creates work logs based on participants' responses",
  '👥 Empowers multiple teams (e.g., Marketing, Dev) within your organization',
];
export default function FeaturesPage() {
  return (
    <div className="text-siya-blue -z-10 flex min-h-screen bg-white">
      <div className="flex w-full flex-col items-center gap-2 pt-8">
        <h3 className="text-siya-yellow text-lg font-bold lg:text-3xl">
          Features
        </h3>
        <div className="flex w-full flex-col items-start gap-4 lg:w-2/3">
          {features.map((feature, index) => (
            <Feature key={index} text={feature} />
          ))}
        </div>
      </div>
    </div>
  );
}
