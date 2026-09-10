import { ReactNode } from "react";

type EntryLayoutProps = {
  children: ReactNode;
};

export default function EntryLayout({ children }: EntryLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16">{children}</div>
  );
}
