
import Image from "next/image"

const Header = () => {

  return (
    <header className="sticky top-0 left-0 w-full bg-[#3f51b5] flex justify-between items-center px-12 py-4 z-30 shadow-xl h-(--header-height)">
        <div className="flex items-center gap-16">
            <Image src="/logo.svg" alt="logo" width={40} height={40} />
            <h1 className="text-3xl text-neutral-50">Money Tracker</h1>
        </div>
        <div>
          <h1 className="text-2xl text-neutral-50">Dashboard</h1>
        </div>
    </header>
  )
}

export default Header
