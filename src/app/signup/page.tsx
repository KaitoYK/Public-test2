import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          this is the signup page
        </h1>
        {/* Add your signup form or buttons here */}
      </div>
    </div>
  );
}

