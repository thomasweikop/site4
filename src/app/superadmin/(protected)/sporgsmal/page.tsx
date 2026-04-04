import QuestionsManager from "@/components/superadmin/QuestionsManager";
import { listEditableQuestions } from "@/lib/superadminStore";

export const dynamic = "force-dynamic";

export default async function SuperadminQuestionsPage() {
  const questions = await listEditableQuestions();

  return <QuestionsManager initialQuestions={questions} />;
}
