import Link from 'next/link'

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1>Home</h1>
        <h2>Map</h2>
        <Link href="/about">About</Link>
      </div>
    </div>
  )
}