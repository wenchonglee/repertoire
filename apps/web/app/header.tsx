import Link from "next/link";

export default function Header() {
  return (
    <div className="flex-col md:flex">
      <div className="border-b">
        <div className="mx-auto max-w-screen-xl flex h-16 items-center px-4">
          <nav className="flex items-center space-x-4 lg:space-x-6 px-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Repertoire
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
