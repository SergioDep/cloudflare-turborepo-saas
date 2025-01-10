export const runtime = "edge";

export default function Page() {
  return (
    <main className="relative flex h-full flex-1 flex-col gap-4 overflow-y-auto p-4 lg:gap-6 lg:p-6">
      <div className="flex flex-col">
        <h1 className="text-lg font-bold md:text-3xl">Accounts</h1>
        <p className="primary-foreground/60 mt-2">Manage your CRM accounts.</p>
      </div>
    </main>
  );
}
