import { ArrowRightLeft, Newspaper, CreditCard, ChartSpline, ShoppingBasket, SlidersHorizontal, LucideIcon } from 'lucide-react'
import React from 'react'

const NavElement = ({ name, icon } : { name: string, icon: LucideIcon}) =>{

    const IconComponent = icon;
    return (
      <li>
          <button className="is-drawer-close:tooltip is-drawer-close:tooltip-right gap-4" data-tip={name}>
              <IconComponent className="inline-block size-8 my-1.5" />
              <span className="is-drawer-close:hidden">{name}</span>
          </button>
      </li>
    )
}

const NavBar = ({ children } : { children: React.ReactNode }) => {
  return (
    <nav className="drawer drawer-open">
        <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
            {children}
        </div>

        <div className="drawer-side is-drawer-close:overflow-visible h-[calc(100vh-var(--header-height))]">
            <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
            <div className="is-drawer-close:w-18 is-drawer-open:w-64 shadow-gray-500 shadow-xl bg-white flex flex-col items-start fixed h-[calc(100vh-var(--header-height))]">
                {/* Sidebar content here */}
                <ul className="menu w-full grow gap-2">

                    {/* list item */}
                    <NavElement name='Dashboard' icon={Newspaper}/>

                    {/* list item */}
                    <NavElement name='Transactions' icon={ArrowRightLeft}/>

                    <NavElement name='Accounts' icon={CreditCard}/>

                    <NavElement name='Reports' icon={ChartSpline} />

                    <NavElement name='Budget' icon={ShoppingBasket} />
                    
                    <NavElement name='Settings' icon={SlidersHorizontal} />
                    
                </ul>

                {/* button to open/close drawer */}
                <div className="m-4 is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Open">
                    <label htmlFor="my-drawer-4" className="btn btn-ghost btn-circle drawer-button is-drawer-open:rotate-y-180">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="inline-block size-6 my-1.5"><path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path><path d="M9 4v16"></path><path d="M14 10l2 2l-2 2"></path></svg>
                    </label>
                </div>

            </div>
        </div>
    </nav>
  )
}

export default NavBar
