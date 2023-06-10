export default function BackgroundCircles() {
  return (
    <div className="-z-10 opacity-5">
      <div className="border-siya-yellow absolute left-0 top-10 h-24 w-24 rounded-full border-4 lg:h-48 lg:w-48" />
      <div className="border-siya-blue absolute left-0 top-10 h-32 w-32 rounded-full border-4 lg:h-64 lg:w-64" />
      <div className="border-siya-yellow absolute left-0 top-10 h-48 w-48 rounded-full border-4 lg:h-96 lg:w-96" />
      <div className="border-siya-blue lg:h-128 lg:w-128 absolute left-0 top-10 h-48 w-48 rounded-full border-4" />
      <div className="border-siya-yellow lg:h-160 lg:w-160 absolute right-0 top-10 h-56 w-56 rounded-full border-4" />
      <div className="border-siya-blue lg:h-144 lg:w-144 absolute right-0 top-10 h-64 w-64 rounded-full border-4" />
      <div className="border-siya-yellow top-50 absolute right-20 h-32 w-32 rounded-full border-4 lg:h-64 lg:w-64" />
      <div className="border-siya-yellow lg:h-128 lg:w-128 absolute bottom-10 left-0 h-72 w-72 rounded-full border-4" />
    </div>
  );
}
