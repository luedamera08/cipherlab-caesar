import { createFileRoute } from "@tanstack/react-router";
import CipherLab from "~/components/CipherLab";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return <CipherLab />;
}
