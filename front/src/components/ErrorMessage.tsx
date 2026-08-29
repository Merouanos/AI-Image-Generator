interface ErrorMessageProps {
  message: string | null;
}

export function ErrorMessage({
  message,
}: ErrorMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
      {message}
    </div>
  );
}