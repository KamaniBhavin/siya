type CheckProps = {
  text: string;
};
export default function Feature({ text }: CheckProps) {
  return (
    <div className="flex w-full items-center gap-2 rounded-2xl border-2 border-gray-600">
      <div className="bg-siya-yellow flex h-2 w-2 items-center justify-center rounded-full lg:h-6 lg:w-6 m-4">
        <span> ✓ </span>
      </div>
      <span className="text-sm font-semibold tracking-tight lg:text-lg">
        {text}
      </span>
    </div>
  );
}
