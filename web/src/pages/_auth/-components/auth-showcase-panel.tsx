type AuthShowcasePanelProps = {
  title: string;
  text: string;
};

export function AuthShowcasePanel({ title, text }: AuthShowcasePanelProps) {
  return (
    <div className="relative hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-end lg:p-16">
      <h2 className="max-w-md text-4xl font-bold tracking-tight">{title}</h2>
      <p className="mt-4 max-w-md text-lg opacity-80">{text}</p>
    </div>
  );
}
