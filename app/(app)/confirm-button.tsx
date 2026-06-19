"use client";

// Botão de submit que pede confirmação antes de disparar a server action do
// <form> em que está. Usado em exclusões.
export function ConfirmButton({
  children,
  message = "Tem certeza?",
  className,
}: {
  children: React.ReactNode;
  message?: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
