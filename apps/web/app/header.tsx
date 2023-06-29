import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <div className="flex-col md:flex">
      <div className="border-b">
        <div className="mx-auto max-w-screen-xl flex h-16 items-center px-3">
          <nav className="flex items-center space-x-4 lg:space-x-6 px-6">
            <Link
              href="/"
              className="text-sm font-semibold transition-colors hover:text-primary flex items-center space-x-2"
            >
              <Image src="/logo192.png" width={32} height={32} alt="logo" />
              <span>Repertoire</span>
            </Link>

            {/* <div>API Keys</div> */}
          </nav>
        </div>
      </div>
    </div>
  );
}
