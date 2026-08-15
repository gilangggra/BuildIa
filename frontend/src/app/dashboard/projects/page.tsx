import { redirect } from "next/navigation";

export default function ProjectsPage() {
  // Currently, the project list is displayed on the main dashboard overview page.
  // We redirect this route there to maintain a single source of truth.
  redirect("/dashboard");
}
