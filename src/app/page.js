import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      this is main page
      <Link href="/login">login</Link>
    </div>
  );
}
 