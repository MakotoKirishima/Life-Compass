import Link from "next/link";

interface FeatureLockCardProps {
  title: string;
  description: string;
  icon?: string;
}

export default function FeatureLockCard({ title, description, icon = "🔒" }: FeatureLockCardProps) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-dashed border-gray-300 p-6 text-center hover:shadow-sm transition">
      <div className="text-3xl mb-3">{icon}</div>
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      <Link
        href="/login"
        className="inline-block bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-sm"
      >
        Masuk untuk membuka
      </Link>
    </div>
  );
}
