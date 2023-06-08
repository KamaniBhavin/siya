type ImageLoaderProps = { src: string };

export default function image({ src }: ImageLoaderProps) {
  return `https://siya.bhavinkamani.com${src}`;
}
