import { Fragment } from "react";

/** Títulos con & en Marydale (acento de marca). */
export function BrandTitle({ children }: { children: string }) {
  const text = children ?? "";
  if (!text.includes("&")) return <>{text}</>;

  const parts = text.split("&");
  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={`${index}-${part}`}>
          {index > 0 && (
            <span className="title-amp" aria-hidden="true">
              &
            </span>
          )}
          {part}
        </Fragment>
      ))}
    </>
  );
}
