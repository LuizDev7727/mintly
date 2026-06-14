import { Link, useMatchRoute, type LinkProps } from "@tanstack/react-router";

export function NavLink(props: LinkProps) {
  const matchRoute = useMatchRoute();

  const match = matchRoute({
    to: props.to,
  });

  const isCurrent = !!match;

  return <Link data-current={isCurrent} {...props} />;
}
