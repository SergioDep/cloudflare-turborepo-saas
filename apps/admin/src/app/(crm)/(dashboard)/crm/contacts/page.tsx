export const runtime = "edge";

export default function Page() {
  return (
    <main className="relative flex h-full flex-1 flex-col gap-4 overflow-y-auto p-4 lg:gap-6 lg:p-6">
      <div className="flex flex-col">
        <h1 className="text-lg font-bold md:text-3xl">Contacts</h1>
        <p className="primary-foreground/60 mt-2">
          Contacts are people you do business with. You can add contacts to
          deals, organizations, activities, and more.
        </p>
      </div>
    </main>
  );
}
