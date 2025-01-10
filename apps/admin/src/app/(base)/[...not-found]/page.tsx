import { notFound } from "next/navigation";

export const runtime = "edge";

export default function NotFound() {
  return notFound();
}
