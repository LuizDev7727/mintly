import { ReactNode } from "react";

type PostLayoutProps = {
  children: ReactNode;
};

export default function PostLayout({ children }: PostLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16">{children}</div>
  );
}
