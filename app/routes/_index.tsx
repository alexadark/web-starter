export function meta() {
  return [
    { title: "Web Starter" },
    {
      name: "description",
      content: "A minimal React Router 7 starter template.",
    },
  ];
}

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Welcome</h1>
        <p className="mt-4 text-muted-foreground">
          Start building your project.
        </p>
      </div>
    </div>
  );
}
