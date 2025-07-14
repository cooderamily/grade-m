import ImportScoreForm from '@/components/ImportScoreForm';

export default function ImportScorePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Import Scores from Excel</h1>
      <ImportScoreForm />
    </div>
  );
}
